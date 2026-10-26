
const Visitor = require("../models/Visitor");
const Appointment = require("../models/Appointment");
const Pass = require("../models/Pass");
const CheckLog = require("../models/CheckLog");

// GET /api/dashboard/stats
// Return dashboard statistics.
exports.getStats = async (req, res) => {
  try {
    const [
      totalVisitors,
      totalAppointments,
      totalPasses,
      checkedInVisitors,
      checkedOutVisitors,
    ] = await Promise.all([
      Visitor.countDocuments(),
      Appointment.countDocuments(),
      Pass.countDocuments(),
      CheckLog.countDocuments({ checkOutTime: null }),
      CheckLog.countDocuments({
        checkOutTime: { $ne: null },
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalVisitors,
        totalAppointments,
        totalPasses,
        checkedInVisitors,
        checkedOutVisitors,
      },
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics",
    });
  }
};

// GET /api/dashboard/passes
// Search, filter and paginate visitor passes.
exports.getPasses = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      fromDate = "",
      toDate = "",
      page = "1",
      limit = "10",
    } = req.query;

    // Validate query parameter types.
    if (
      typeof search !== "string" ||
      typeof status !== "string" ||
      typeof fromDate !== "string" ||
      typeof toDate !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid search or filter parameters",
      });
    }

    const filter = {};

    // Search visitor/pass fields.
    if (search.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { visitorName: regex },
        { email: regex },
        { phone: regex },
        { company: regex },
        { passNumber: regex },
        { qrCode: regex },
      ];
    }

    // Filter by the exact status value.
    if (status.trim()) {
      filter.status = status.trim();
    }

    // Filter by issue date, including the full end date.
    if (fromDate || toDate) {
      filter.issueDate = {};

      const isValidDate = (value) =>
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
        new Date(`${value}T00:00:00.000Z`)
          .toISOString()
          .startsWith(value);

      if (fromDate) {
        if (!isValidDate(fromDate)) {
          return res.status(400).json({
            success: false,
            message: "Invalid fromDate. Use YYYY-MM-DD.",
          });
        }

        filter.issueDate.$gte = new Date(
          `${fromDate}T00:00:00.000Z`
        );
      }

      if (toDate) {
        if (!isValidDate(toDate)) {
          return res.status(400).json({
            success: false,
            message: "Invalid toDate. Use YYYY-MM-DD.",
          });
        }

        const endDate = new Date(
          `${toDate}T00:00:00.000Z`
        );

        endDate.setUTCDate(endDate.getUTCDate() + 1);

        filter.issueDate.$lt = endDate;
      }

      if (fromDate && toDate && fromDate > toDate) {
        return res.status(400).json({
          success: false,
          message: "fromDate cannot be after toDate",
        });
      }
    }

    // Validate and limit pagination.
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    if (
      !/^\d+$/.test(String(page)) ||
      !/^\d+$/.test(String(limit)) ||
      !Number.isSafeInteger(parsedPage) ||
      !Number.isSafeInteger(parsedLimit) ||
      parsedPage < 1 ||
      parsedLimit < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive integers",
      });
    }

    const currentPage = parsedPage;
    const pageSize = Math.min(parsedLimit, 100);

    const [passes, total] = await Promise.all([
      Pass.find(filter)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Pass.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: passes,
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Dashboard pass search error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch visitor passes",
    });
  }
};
