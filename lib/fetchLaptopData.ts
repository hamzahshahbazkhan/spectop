import * as cheerio from "cheerio";
// import puppeteer from "puppeteer";
// const chromium = require("@sparticuz/chromium");
// const puppeteer = require("puppeteer-core");
// import chromium from "@sparticuz/chromium";
// import puppeteer from "puppeteer-core";
import puppeteer from "puppeteer";
import type { Browser as PuppeteerBrowser } from "puppeteer";
import type { Browser as PuppeteerCoreBrowser } from "puppeteer-core";
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

// export default async function fetchLaptopData(
//   firstUrl: string,
//   secondUrl: string
// ) {
//   try {
//     if (!firstUrl || !secondUrl) {
//       return { error: "Both URLs are required" };
//     }
//     const [firstProduct, secondProduct] = await Promise.all([
//       getDetails(firstUrl),
//       getDetails(secondUrl),
//     ]);
//     if (typeof firstProduct === "string") {
//       return { error: `First product: ${firstProduct}` };
//     }
//     if (typeof secondProduct === "string") {
//       return { error: `Second product: ${secondProduct}` };
//     }
//     return { firstProduct, secondProduct };
//   } catch (error) {
//     return { error: error };
//   }
// }

type SharedBrowser = PuppeteerBrowser | PuppeteerCoreBrowser;

const CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

const isProductionEnv =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL_ENV === "production";

const launchSharedBrowser = async (): Promise<SharedBrowser> => {
  if (isProductionEnv) {
    const executablePath = await chromium.executablePath(CHROMIUM_PACK_URL);
    return (await puppeteerCore.launch({
      executablePath,
      args: chromium.args,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    })) as unknown as SharedBrowser;
  }
  return (await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })) as unknown as SharedBrowser;
};

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default async function fetchLaptopData(
  firstUrl: string,
  secondUrl: string
) {
  try {
    if (!firstUrl || !secondUrl) {
      return { error: "Both URLs are required" };
    }

    const supported = (u: string) =>
      u.includes("amazon") ||
      u.includes("amzn") ||
      u.includes("flipkart") ||
      u.includes("flip");
    if (!supported(firstUrl) || !supported(secondUrl)) {
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
    }

    let browser: SharedBrowser | null = null;
    try {
      try {
        browser = await launchSharedBrowser();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("ETXTBSY")) throw err;
        await sleep(1000);
        browser = await launchSharedBrowser();
      }

      const shared = browser;
      const [firstProduct, secondProduct] = await Promise.all([
        getDetails(firstUrl, shared),
        getDetails(secondUrl, shared),
      ]);
      if (typeof firstProduct === "string") {
        return { error: `First product: ${firstProduct}` };
      }

      if (typeof secondProduct === "string") {
        return { error: `Second product: ${secondProduct}` };
      }

      return { firstProduct, secondProduct };
    } finally {
      if (browser) {
        await (browser as PuppeteerCoreBrowser).close().catch(() => {});
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

const getDetails = async (
  url: string,
  sharedBrowser?: SharedBrowser
): Promise<Product | string> => {
  if (!url) {
    return "URL is required";
  }
  if (url.includes("amazon") || url.includes("amzn")) {
    return getProductDetails(url, sharedBrowser);
  } else if (url.includes("flipkart") || url.includes("flip")) {
    return getProductDetailsFromFlipkart(url, sharedBrowser);
  } else {
    return "Not a valid website - only Amazon and Flipkart are supported";
  }
};
const getProductDetails = async (
  url: string,
  sharedBrowser?: SharedBrowser
): Promise<Product | string> => {
  const product: Product = {
    bullets: [],
    title: "",
    rating: undefined,
    price: "",
    details: [],
    img: undefined,
    features: [],
  };

  let browser: SharedBrowser | null = sharedBrowser ?? null;
  let ownsBrowser = false;
  // if (
  //   process.env.NODE_ENV === "production" ||
  //   process.env.VERCEL_ENV === "production"
  // ) {
  if (!browser) {
    const executablePath = await chromium.executablePath(CHROMIUM_PACK_URL);
    browser = (await puppeteerCore.launch({
      executablePath,
      args: chromium.args,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    })) as unknown as SharedBrowser;
    ownsBrowser = true;
  }
  // } else {
  //   browser = await puppeteer.launch({
  //     headless: true,
  //     args: ["--no-sandbox", "--disable-setuid-sandbox"],
  //   });
  // }
  let page: Awaited<ReturnType<PuppeteerCoreBrowser["newPage"]>> | null =
    null;
  try {
    page = await (browser as PuppeteerCoreBrowser).newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });

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
    if (page) {
      await page.close().catch(() => {});
    }
    if (ownsBrowser && browser) {
      await (browser as PuppeteerCoreBrowser).close().catch(() => {});
    }
  }
};
const getProductDetailsFromFlipkart = async (
  url: string,
  sharedBrowser?: SharedBrowser
): Promise<Product | string> => {
  const product: Product = {
    title: "",
    rating: undefined,
    price: "",
    details: [],
    img: undefined,
    features: [],
  };

  let browser: SharedBrowser | null = sharedBrowser ?? null;
  let ownsBrowser = false;
  if (!browser) {
    if (isProductionEnv) {
      // Configure the version based on your package.json (for your future usage).
      const executablePath = await chromium.executablePath(CHROMIUM_PACK_URL);
      browser = (await puppeteerCore.launch({
        executablePath,
        // You can pass other configs as required
        args: chromium.args,
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
      })) as unknown as SharedBrowser;
    } else {
      browser = (await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })) as unknown as SharedBrowser;
    }
    ownsBrowser = true;
  }
  let page: Awaited<ReturnType<PuppeteerCoreBrowser["newPage"]>> | null =
    null;
  try {
    // browser = await puppeteer.launch({
    //   headless: true,
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // });
    page = await (browser as PuppeteerCoreBrowser).newPage();

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });

    try {
      const clickSpecsTab = () => {
        const tab = Array.from(document.querySelectorAll("div")).find(
          (e) =>
            e.children.length === 0 &&
            e.textContent?.trim() === "Specifications"
        );
        (tab as HTMLElement | undefined)?.click();
      };
      await (page.evaluate as (fn: () => void) => Promise<void>)(
        clickSpecsTab
      );
      await page.waitForSelector("div.grid-formation-dynamic", {
        timeout: 15000,
      });
    } catch {
    }

    const content = await page.content();
    const $ = cheerio.load(content);

    const jsonLd = JSON.parse($("script#jsonLD").html() || "[]") as Array<{
      name?: string;
      image?: string[];
      offers?: { price?: number | string };
      aggregateRating?: { ratingValue?: string; ratingCount?: number };
    }>;
    const info = jsonLd[0] || {};
    product.title = (info.name || "").trim();
    product.rating = info.aggregateRating?.ratingValue
      ? `${info.aggregateRating.ratingValue} (${info.aggregateRating.ratingCount ?? 0} ratings)`
      : undefined;
    product.price =
      info.offers?.price !== undefined ? `₹${info.offers.price}` : "";
    product.img = info.image?.[0];

    product.features = [];

    const tableData: Record<string, string> = {};
    $("div.grid-formation-dynamic").each((i, elem) => {
      const key = $(elem).find("div.v1zwn21o").first().text().trim();
      const value = $(elem).find("div.v1zwn21n").first().text().trim();
      if (key && value) {
        tableData[key] = value;
      }
    });

    product.details = [tableData];

    if (product.title === "" || Object.keys(tableData).length === 0) {
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
    if (page) {
      await page.close().catch(() => {});
    }
    if (ownsBrowser && browser) {
      await (browser as PuppeteerCoreBrowser).close().catch(() => {});
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
