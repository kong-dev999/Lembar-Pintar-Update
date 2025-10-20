import prisma from "@/prisma/index";

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === "GET") {
        try {
            const design = await prisma.design.findUnique({
                where: {
                    id: id
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    workspace: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    folder: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            if (!design) {
                return res.status(404).json({
                    success: false,
                    message: "Design tidak ditemukan"
                });
            }

            res.status(200).json({
                success: true,
                design: design
            });
        } catch (error) {
            console.error("Error fetching design:", error);
            res.status(500).json({
                success: false,
                message: "Gagal memuat design"
            });
        }
    } else {
        res.setHeader("Allow", ["GET"]);
        res.status(405).json({
            success: false,
            message: `Method ${req.method} tidak diizinkan`
        });
    }
}