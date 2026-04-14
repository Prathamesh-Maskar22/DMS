import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // ✅ Clear all required keys
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("sidebarCollapsed");
        localStorage.removeItem("user");

        // ✅ Optional: clear entire storage
        localStorage.clear();

        // ✅ Redirect to login
        navigate("/login", { replace: true });
    }, [navigate]);

    return null; // 🚫 No UI
};

export default Logout;