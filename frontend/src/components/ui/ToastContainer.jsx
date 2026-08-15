import { Toaster } from "react-hot-toast";
import { ToasterConfig } from "@/services/toast";

/**
 * App toast host. Mount once near the root. Extends the shared ToasterConfig
 * from the toast service, allowing route-level overrides via `props`.
 */
const ToastContainer = (props) => <Toaster {...ToasterConfig} {...props} />;

export default ToastContainer;