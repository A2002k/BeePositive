import Order from "../models/Order.js";
import User from "../models/User.js";

export async function getAdminCustomers(req, res) {
  try {
    const customers = await User.find({
      role: "customer",
    })
      .select(
        "name email phone role isActive createdAt updatedAt"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    const orderStatistics = await Order.aggregate([
      {
        $match: {
          status: {
            $ne: "cancelled",
          },
        },
      },
      {
        $group: {
          _id: "$user",

          totalOrders: {
            $sum: 1,
          },

          totalSpent: {
            $sum: "$total",
          },

          lastOrderAt: {
            $max: "$createdAt",
          },
        },
      },
    ]);

    const statisticsByCustomer = new Map(
      orderStatistics.map((statistics) => [
        statistics._id.toString(),
        statistics,
      ])
    );

    const formattedCustomers = customers.map(
      (customer) => {
        const statistics =
          statisticsByCustomer.get(
            customer._id.toString()
          );

        return {
          ...customer,

          totalOrders:
            statistics?.totalOrders || 0,

          totalSpent:
            statistics?.totalSpent || 0,

          lastOrderAt:
            statistics?.lastOrderAt || null,
        };
      }
    );

    return res.status(200).json({
      success: true,
      count: formattedCustomers.length,
      customers: formattedCustomers,
    });
  } catch (error) {
    console.error(
      "Get admin customers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve customers.",
    });
  }
}