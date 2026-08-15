const HomeSettings = require("./homeSettings.model");
const ApiError = require("../../utils/ApiError");
const { getCache, setCache, deleteCacheByPattern } = require("../../config/redis");
const { CACHE_TTL } = require("../../config/constants");

const SETTINGS_KEY = "homeSettings:singleton";

class HomeSettingsService {
  /** Upsert the singleton document so GET /home-settings never 404s on an empty DB. */
  async getSettings() {
    const cached = await getCache(SETTINGS_KEY);
    if (cached) return cached;

    const settings = await HomeSettings.findOne({ key: "home" }).lean();
    const shaped = settings || { key: "home", sections: {}, content: {}, seo: {} };

    await setCache(SETTINGS_KEY, shaped, CACHE_TTL.ROOM_LIST);
    return shaped;
  }

  async updateSettings(data) {
    // Whitelist the writable bags so nested section flags can be merged safely.
    const update = {};
    if (data.sections && typeof data.sections === "object") update.sections = data.sections;
    if (data.content && typeof data.content === "object") update.content = data.content;
    if (data.seo && typeof data.seo === "object") update.seo = data.seo;

    const settings = await HomeSettings.findOneAndUpdate(
      { key: "home" },
      { $set: update },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    await deleteCacheByPattern("homeSettings:*");
    return settings;
  }

  async resetSettings() {
    const settings = await HomeSettings.findOne({ key: "home" });
    if (!settings) throw ApiError.notFound("Home settings not found.");
    const defaults = new HomeSettings().toObject();
    // Reset only the writable bags to the model defaults. Copying the whole
    // `defaults` object would stamp a FRESH `_id` onto the loaded doc; the later
    // `save()` would then update by that new id → DocumentNotFoundError → 500.
    settings.sections = defaults.sections;
    settings.content = defaults.content;
    settings.seo = defaults.seo;
    await settings.save();
    await deleteCacheByPattern("homeSettings:*");
    return settings;
  }
}

module.exports = new HomeSettingsService();