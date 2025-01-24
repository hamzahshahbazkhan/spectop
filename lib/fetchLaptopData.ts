import * as cheerio from "cheerio";
// import puppeteer from "puppeteer";
// const chromium = require("@sparticuz/chromium");
// const puppeteer = require("puppeteer-core");
// import chromium from "@sparticuz/chromium";
// import puppeteer from "puppeteer-core";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

interface Product {
  title: string;
  rating: string | undefined;
  price: string;
  details: Record<string, string>[];
  features: Record<string, string>[];
  img: string | undefined;
  bullets?: string[];
  specs?: Record<string, string>;
}

export default async function fetchLaptopData(
  firstUrl: string,
  secondUrl: string
) {
  try {
    if (!firstUrl || !secondUrl) {
      return { error: "Both URLs are required" };
    }
    const [firstProduct, secondProduct] = await Promise.all([
      getDetails(firstUrl),
      getDetails(secondUrl),
    ]);
    if (typeof firstProduct === "string") {
      return { error: `First product: ${firstProduct}` };
    }
    if (typeof secondProduct === "string") {
      return { error: `Second product: ${secondProduct}` };
    }
    return { firstProduct, secondProduct };
  } catch (error) {
    return { error: error };
  }
}

const getDetails = async (url: string): Promise<Product | string> => {
  if (!url) {
    return "URL is required";
  }
  if (url.includes("amazon") || url.includes("amzn")) {
    return getProductDetails(url);
  } else if (url.includes("flipkart") || url.includes("flip")) {
    return getProductDetailsFromFlipkart(url);
  } else {
    return "Not a valid website - only Amazon and Flipkart are supported";
  }
};
const getProductDetails = async (url: string): Promise<Product | string> => {
  const product: Product = {
    bullets: [],
    title: "",
    rating: undefined,
    price: "",
    details: [],
    img: undefined,
    features: [],
  };

  let browser = null;
  if (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  ) {
    const executablePath = await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
    );
    browser = await puppeteerCore.launch({
      executablePath,
      args: chromium.args,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });
  } else {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const content = await page.content();
    const $ = cheerio.load(content);

    product.title = $("#productTitle").text().trim();
    product.rating = $("#acrPopover").attr("title")?.trim();
    product.price = $("span.a-price-whole").first().text().trim();
    product.img = $("#landingImage").attr("src");

    const bullets: string[] = [];
    $("#feature-bullets ul.a-unordered-list li span.a-list-item").each(
      (i, elem) => {
        bullets.push($(elem).text().trim());
      }
    );
    product.bullets = bullets;

    const tableData: Record<string, string>[] = [];
    $("#poExpander table tbody tr").each((i, row) => {
      const key = $(row)
        .find("td.a-span3 span.a-size-base.a-text-bold")
        .text()
        .trim();
      const value = $(row)
        .find("td.a-span9 span.a-size-base.po-break-word")
        .text()
        .trim();
      if (key && value) {
        tableData.push({ key, value });
      }
    });
    product.details = tableData;

    const specsTableData: Record<string, string> = {};
    $("table.prodDetTable tr").each((i, row) => {
      const key = $(row).find("th.prodDetSectionEntry").text().trim();
      const value = $(row).find("td.prodDetAttrValue").text().trim();
      if (key && value) {
        specsTableData[key] = value;
      }
    });
    product.specs = specsTableData;

    if (product.title === "" || product.details.length === 0) {
      return "Invalid product page structure";
    }

    return product;
  } catch (error) {
    console.error("Request failed:", error);
    return "Failed to fetch product details from Amazon";
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
const getProductDetailsFromFlipkart = async (
  url: string
): Promise<Product | string> => {
  const product: Product = {
    title: "",
    rating: undefined,
    price: "",
    details: [],
    img: undefined,
    features: [],
  };

  let browser = null;
  if (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  ) {
    // Configure the version based on your package.json (for your future usage).
    const executablePath = await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
    );
    browser = await puppeteerCore.launch({
      executablePath,
      // You can pass other configs as required
      args: chromium.args,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });
  } else {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  try {
    // browser = await puppeteer.launch({
    //   headless: true,
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    const content = await page.content();
    const $ = cheerio.load(content);

    product.title = $("span.VU-ZEz").text().trim();
    product.rating = $("div.XQDdHH").text().trim();
    product.price = $("div.Nx9bqj.CxhGGd").text().trim();
    product.img = $("img.DByuf4.IZexXJ.jLEJ7H").attr("src");

    const listItems: Record<string, string>[] = [];
    $("div.pqHCzB").each((i, elem) => {
      const title = $(elem).find("._9GQWrZ").text().trim();
      listItems.push({ title });
    });
    product.features = listItems;

    const tableData: Record<string, string> = {};
    $("tr.WJdYP6").each((i, elem) => {
      const key = $(elem).find("td.+fFi1w").text().trim();
      const value = $(elem).find("td.Izz52n li").text().trim();
      if (key) {
        tableData[key] = value;
      }
    });

    product.details = [tableData];

    if (product.title === "" || product.details.length === 0) {
      return "Invalid product page structure";
    }

    if (!isValidProduct(product)) {
      return "Invalid product page structure";
    }
    return product;
  } catch (error) {
    console.error("Request failed:", error);
    return "Failed to fetch product details from Flipkart";
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
const isValidProduct = (product: Product): boolean => {
  // Check if title contains "aptop"
  if (product.title.includes("aptop")) return true;

  // Check if any detail value contains "aptop"
  const hasLaptopInDetails = product.details.some((detail) =>
    Object.values(detail).some((value) => value.toLowerCase().includes("aptop"))
  );

  return hasLaptopInDetails;
};
