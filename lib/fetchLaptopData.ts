import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

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
    return { error: "Failed to fetch laptop data" };
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
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Basic product info
    product.title = await page.$eval(
      "#productTitle",
      (el) => el.textContent?.trim() || ""
    );
    product.rating = await page.$eval(
      "#acrPopover",
      (el) => el.getAttribute("title")?.trim() || ""
    );
    product.price = await page.$eval(
      "span.a-price-whole",
      (el) => el.textContent?.trim() || ""
    );
    product.img = await page.$eval(
      "#landingImage",
      (el) => el.getAttribute("src") || ""
    );

    // Feature bullets
    const featureList = await page.$$eval(
      "#feature-bullets ul.a-unordered-list li span.a-list-item",
      (elems) => elems.map((elem) => elem.textContent?.trim() || "")
    );
    product.bullets = featureList;

    // Product details table
    const tableData: Record<string, string>[] = [];
    const rows = await page.$$("#poExpander table tbody tr");
    for (const row of rows) {
      try {
        const key = await row.$eval(
          "td.a-span3 span.a-size-base.a-text-bold",
          (el) => el.textContent?.trim() || ""
        );
        const value = await row.$eval(
          "td.a-span9 span.a-size-base.po-break-word",
          (el) => el.textContent?.trim() || ""
        );
        if (key && value) {
          tableData.push({ key, value });
        }
      } catch (err) {
        continue;
      }
    }
    product.details = tableData;

    // Specs table
    const specsTableData: Record<string, string> = {};
    const drows = await page.$$("table.prodDetTable tr");
    for (const drow of drows) {
      try {
        const key = await drow.$eval(
          "th.prodDetSectionEntry",
          (el) => el.textContent?.trim() || ""
        );
        const value = await drow.$eval(
          "td.prodDetAttrValue",
          (el) => el.textContent?.trim() || ""
        );
        if (key && value) {
          specsTableData[key] = value;
        }
      } catch (error) {
        continue;
      }
    }
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
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
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
