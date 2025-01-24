import { NextRequest, NextResponse } from "next/server";
import fetchLaptopData from "@/lib/fetchLaptopData";

const POST = async (req: NextRequest) => {
  try {
    const { firstUrl, secondUrl } = await req.json();
    const response = await fetchLaptopData(firstUrl, secondUrl);
    if (response.error) {
      console.log(response);
      return NextResponse.json(
        {
          error: "Not a valid url",
        },
        {
          status: 400,
        }
      );
    }
    const { firstProduct, secondProduct } = response;
    // const { firstProduct, secondProduct } = await fetchLaptopData(
    //   firstUrl,
    //   secondUrl
    // );
    if (typeof firstProduct === "string" || typeof secondProduct === "string") {
      return NextResponse.json(
        {
          error: "Not a valid url",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      firstProduct,
      secondProduct,
      hello: "hello",
    });
  } catch (error) {
    console.error("Error fetching laptop data:", error);
    return NextResponse.json(
      { error: "Failed to fetch laptop data" },
      { status: 500 }
    );
  }
};

export { POST };
