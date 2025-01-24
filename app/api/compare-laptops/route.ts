import { NextRequest, NextResponse } from "next/server";
import laptopComparision from "@/lib/laptopComparision";

const POST = async (req: NextRequest) => {
  try {
    const { firstProduct, secondProduct, preferenceTags } = await req.json();
    const result = await laptopComparision({
      firstProduct,
      secondProduct,
      preferenceTags,
    });

    return NextResponse.json({
      result,
    });
  } catch (error) {
    console.error("Error fetching laptop data:", error);
    return NextResponse.json(
      { error: "Error comparing data" },
      { status: 500 }
    );
  }
};

export { POST };
