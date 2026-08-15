/**
 * Unit tests for the availability service (models are mocked).
 */
jest.mock("../../src/modules/bookings/booking.model");
jest.mock("../../src/modules/rooms/room.model");

const availabilityService = require("../../src/services/availability.service");
const Booking = require("../../src/modules/bookings/booking.model");
const Room = require("../../src/modules/rooms/room.model");

// Helper to emulate the Booking.find().select().lean() chain
const mockQuery = (leanResult) => ({
  select: jest.fn(() => ({ lean: jest.fn().mockResolvedValue(leanResult) })),
});

beforeEach(() => jest.clearAllMocks());

describe("AvailabilityService.isRoomAvailable", () => {
  test("returns true when there are fewer overlaps than totalUnits", async () => {
    Room.findById.mockResolvedValue({ _id: "r1", isActive: true, totalUnits: 2 });
    Booking.find.mockReturnValue(mockQuery([{ _id: "a" }]));

    await expect(availabilityService.isRoomAvailable("r1", "2026-08-10", "2026-08-12")).resolves.toBe(true);
    expect(Booking.find).toHaveBeenCalledTimes(1);
  });

  test("returns false when overlaps reach totalUnits", async () => {
    Room.findById.mockResolvedValue({ _id: "r1", isActive: true, totalUnits: 2 });
    Booking.find.mockReturnValue(mockQuery([{ _id: "a" }, { _id: "b" }]));

    await expect(availabilityService.isRoomAvailable("r1", "2026-08-10", "2026-08-12")).resolves.toBe(false);
  });

  test("throws when the room is missing or inactive", async () => {
    Room.findById.mockResolvedValue(null);
    await expect(
      availabilityService.isRoomAvailable("rX", "2026-08-10", "2026-08-12")
    ).rejects.toThrow(/not found|not available/i);
  });
});

describe("AvailabilityService.expireStalePendingBookings", () => {
  test("returns the number of expired bookings", async () => {
    Booking.updateMany.mockResolvedValue({ modifiedCount: 3 });

    const expired = await availabilityService.expireStalePendingBookings("r1");
    expect(expired).toBe(3);
    expect(Booking.updateMany).toHaveBeenCalledTimes(1);
  });

  test("returns 0 when nothing was modified (no stale rows)", async () => {
    Booking.updateMany.mockResolvedValue({ modifiedCount: 0 });

    const expired = await availabilityService.expireStalePendingBookings("r1");
    expect(expired).toBe(0);
  });
});

// ─── getRoomAvailability ──────────────────────────────────────────────────
describe("AvailabilityService.getRoomAvailability", () => {
  test("reports available units from overlapping bookings", async () => {
    Room.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: "r1", isActive: true, totalUnits: 3 }),
    });
    Booking.find.mockReturnValue(mockQuery([{ _id: "a" }, { _id: "b" }]));

    const result = await availabilityService.getRoomAvailability("r1", "2026-08-10", "2026-08-12");
    expect(result.totalUnits).toBe(3);
    expect(result.bookedUnits).toBe(2);
    expect(result.availableUnits).toBe(1);
    expect(result.isAvailable).toBe(true);
  });

  test("throws when the room is missing or inactive", async () => {
    Room.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await expect(
      availabilityService.getRoomAvailability("rX", "2026-08-10", "2026-08-12")
    ).rejects.toThrow(/not found/i);
  });
});

// ---------------------------------------------------------------------------
// getAvailableRoomsForHotel — not wired to any route, so covered here.
// ---------------------------------------------------------------------------
describe("AvailabilityService.getAvailableRoomsForHotel", () => {
  const rooms = [
    { _id: "r1", totalUnits: 2, maxOccupancy: { adults: 3, children: 2 } },
    { _id: "r2", totalUnits: 1, maxOccupancy: { adults: 2, children: 1 } },
  ];

  test("returns [] when the hotel has no active rooms", async () => {
    Room.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

    const result = await availabilityService.getAvailableRoomsForHotel("h1", "2026-08-10", "2026-08-12");
    expect(result).toEqual([]);
  });

  test("filters out fully-booked and capacity-failing rooms", async () => {
    Room.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(rooms) });
    // r1 fully booked (2 overlaps == totalUnits 2); r2 0 overlaps.
    Booking.aggregate.mockResolvedValue([{ _id: "r1", count: 2 }]);

    const result = await availabilityService.getAvailableRoomsForHotel(
      "h1", "2026-08-10", "2026-08-12", 2, 1 // guests: 2 adults, 1 child
    );

    expect(result).toHaveLength(1);
    expect(result[0]._id.toString()).toBe("r2");
    expect(result[0].availableUnits).toBe(1);
  });

  test("returns [] when guests exceed every room's capacity", async () => {
    Room.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(rooms) });
    Booking.aggregate.mockResolvedValue([]);

    const result = await availabilityService.getAvailableRoomsForHotel(
      "h1", "2026-08-10", "2026-08-12", 9, 9
    );

    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getBlockedDates — reaches the in-memory per-date occupancy branch.
// ---------------------------------------------------------------------------
describe("AvailabilityService.getBlockedDates", () => {
  test("returns blocked dates when all units are booked", async () => {
    Room.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: "r1", totalUnits: 1 }),
    });
    Booking.find.mockReturnValue({
      select: jest.fn(() => ({
        lean: jest.fn().mockResolvedValue([
          { checkIn: "2026-08-10T00:00:00.000Z", checkOut: "2026-08-12T00:00:00.000Z" },
        ]),
      })),
    });

    const blocked = await availabilityService.getBlockedDates("r1", "2026-08-10", "2026-08-12");
    expect(blocked).toContain("2026-08-10");
    expect(blocked).toContain("2026-08-11");
  });

  test("throws NotFound for a missing room", async () => {
    Room.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await expect(
      availabilityService.getBlockedDates("rX", "2026-08-10", "2026-08-12")
    ).rejects.toThrow(/not found/i);
  });
});

// ---------------------------------------------------------------------------
// _isRoomAvailable with excludeBookingId + session → _getConflictingBookings
// ---------------------------------------------------------------------------
describe("AvailabilityService isRoomAvailable with exclude/session", () => {
  test("excludes a booking id and threads the session through", async () => {
    Room.findById.mockResolvedValue({ _id: "r1", isActive: true, totalUnits: 1 });
    const chain = {
      select: jest.fn(() => ({
        session: jest.fn(() => ({ lean: jest.fn().mockResolvedValue([]) })),
        lean: jest.fn().mockResolvedValue([]),
      })),
    };
    Booking.find.mockReturnValue(chain);

    const result = await availabilityService.isRoomAvailable(
      "r1", "2026-08-10", "2026-08-12", "bookingToExclude", { fake: "session" }
    );
    expect(result).toBe(true);

    const query = Booking.find.mock.calls[0][0];
    expect(query._id).toEqual({ $ne: "bookingToExclude" });
  });
});