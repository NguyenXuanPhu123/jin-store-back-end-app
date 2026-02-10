import { prisma } from "../database/db.js";

const getAllProducts = async (req, res) => {
  const products = await prisma.product.findMany();

  return res.status(200).json({
    data: {
      products,
    },
  });
};

export { getAllProducts };
