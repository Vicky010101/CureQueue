const jwt = require("jsonwebtoken");

function auth(req, res, next) {
    const token = req.header("x-auth-token");
    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        const jwtSecret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
        const decoded = jwt.verify(token, jwtSecret);

        // Keep same behavior — attach decoded data to request
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT Error:", err.message);

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ msg: "Token expired, please login again" });
        }

        return res.status(401).json({ msg: "Token is not valid" });
    }
}

function roleCheck(...roles) {
    return (req, res, next) => {
        // Protect against undefined user (safety improvement)
        if (!req.user?.role) {
            return res.status(401).json({ msg: "User role missing, authorization denied" });
        }

        // No logic change — same validation
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: "Access denied" });
        }

        next();
    };
}

module.exports = { auth, roleCheck };
