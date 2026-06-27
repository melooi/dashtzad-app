import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.findFirst({ where: { phoneNumber: "09120000000" } });
  if (!admin) { console.log("admin not found"); return; }

  await prisma.address.deleteMany({ where: { userId: admin.id } });

  await prisma.address.createMany({
    data: [
      {
        userId: admin.id,
        title: "خانه",
        receiverName: "مهدی احمدی",
        phone: "09120000000",
        province: "تهران",
        city: "تهران",
        line: "خیابان ولیعصر، کوچه بهار، پلاک ۱۲",
        plaque: "12",
        unit: "3",
        postalCode: "1234567890",
        isDefault: true,
      },
      {
        userId: admin.id,
        title: "محل کار",
        receiverName: "مهدی احمدی",
        phone: "09120000000",
        province: "تهران",
        city: "تهران",
        line: "خیابان آزادی، برج تجارت، طبقه ۵",
        plaque: "200",
        unit: "501",
        postalCode: "1456789012",
        isDefault: false,
      },
      {
        userId: admin.id,
        title: "هدیه",
        receiverName: "سارا محمدی",
        phone: "09351234567",
        province: "اصفهان",
        city: "اصفهان",
        line: "خیابان چهارباغ، کوچه گلستان",
        plaque: "7",
        postalCode: "8134567890",
        deliveryNote: "لطفاً زنگ بزنید",
        isDefault: false,
      },
      {
        userId: admin.id,
        title: "ناشناس",
        receiverName: "دوست عزیز",
        phone: "09001234567",
        province: "مازندران",
        city: "ساری",
        line: "خیابان امیرمازندرانی، کوچه رضا",
        plaque: "15",
        unit: "2",
        postalCode: "4813456789",
        deliveryNote: "سوپرایز هست، با احتیاط تحویل دهید",
        isDefault: false,
      },
    ],
  });

  console.log("✅ 4 addresses created for admin (09120000000)");
}

main().finally(async () => { await prisma.$disconnect(); await pool.end(); });
