import { GoogleGenerativeAI } from "@google/generative-ai";

interface Product {
  title: string;
  rating: string | undefined;
  price: string;
  details: Object;
}
interface laptopComparisionProps {
  firstProduct: Product;
  secondProduct: Product;
  preferenceTags: string;
}

export default async function laptopComparision({
  firstProduct,
  secondProduct,
  preferenceTags,
}: laptopComparisionProps) {
  const simpleData =
    JSON.stringify(firstProduct) + JSON.stringify(secondProduct);
  // console.log(firstProduct);
  // console.log(secondProduct);
  // console.log(simpleData);
  const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Given the specifications, rating, and other features of two laptops, generate a factually correct JSON object for each laptop under a single Laptop category. Each laptop's JSON should include a standardized set of attributes without nested categories.

For each laptop, include the following attributes. Do not include any other attribute not mentioned below not even title. the attributes below are exhaustive list.
Make  sure that the facts are right and mentioned in the input if it is not mentioned in the input do put '-' in thaat place. It is very important that thee information is correct and the same as there in input.
. The correctness of the information is most important.
Even if both the laptops are same then output the same information.
This json should have name "Laptops"
Processor: Number of cores, clock speed (GHz), and generation (e.g., "Intel Core i5 13th Gen").
RAM: Capacity and type (e.g., "16GB DDR4").
Graphics: GPU type, memory size (e.g., "NVIDIA GeForce RTX 3060, 6GB").
Storage: Type, speed, and capacity (e.g., "512GB NVMe SSD").
Display Size: Diagonal measurement (e.g., "15.6-inch").
Resolution: Screen resolution (e.g., "Full HD").
Refresh Rate: Measured in Hz (e.g., "144Hz").
Panel Type: Type of panel (e.g., "OLED").
Battery Capacity: Measured in watt-hours (Wh) or milliampere-hours (mAh) (e.g., "70Wh").
Battery Life: Estimated usage hours (e.g., "Up to 10 hours").
Build: Main material used for construction or metal , plastic etc (e.g., "Magnesium alloy").
Dimensions and Weight: Thickness and weight (e.g., "0.7 inches thick, 3.5 lbs").
USB Ports: Types and count (e.g., "1 x USB-C, 2 x USB-A").
HDMI/DisplayPort: HDMI or DisplayPort version (e.g., "HDMI 2.1").
Ethernet Port: Availability (e.g., "Yes" or "No").
Wi-Fi and Bluetooth: Version standards (e.g., "Wi-Fi 6E, Bluetooth 5.2").
Keyboard: Key travel, backlighting (e.g., "Backlit, 1.2mm key travel").
Trackpad: Trackpad quality and features (e.g., "Precision trackpad, multi-gesture support").
Speakers: Speaker type and quality (e.g., "Quad speakers, Harman Kardon").
Operating System: Pre-installed OS (e.g., "Windows 10").
Software: Any pre-installed or bundled software (e.g., "Office 365 Trial, McAfee Antivirus").
Warranty: Warranty duration and details (e.g., "2-year limited warranty").
Others: Any additional features that may not fit into the above categories (e.g., durability certifications, headphone jack, special software, additional ports).

Include a separate Comparison JSON object that compares each laptop on the following 9 key attributes in as short as possible with commentry on which is better in aspect:
This JSON should have name "Comparison"
Every thing from now should be based on my preference tags which are: ${preferenceTags}.Like which is better for my use case and why. Ignore if it is blank
Performance: Compare CPU, RAM, and storage.
Display: Compare display size, resolution, refresh rate, color accuracy, and panel type.
Battery Life: Compare estimated battery durations and capacities.
Build and Design: Compare materials, dimensions, and weight.
Connectivity and Ports: Compare USB, HDMI, Ethernet, and wireless features.
Keyboard and Trackpad: Compare keyboard travel, backlighting, and trackpad features.
Audio: Compare speaker quality, placement, and additional audio features.
Operating System and Software: Compare pre-installed OS and any bundled software.
Warranty and Other Features: Compare warranty options and any additional features in the "Others" category.
Give the complete output in one single JSON object. 

Include a separate Comparison JSON object that has the final verdit on which laptop should i buy. It should be the string in three to four lines that give the extensive and analytical verdict on which laptop should i buy. It should be based on my preference tags which has my priorities and what i am looking for. Here are my preference tags. Ignore if they are empty ${preferenceTags.length}:. This JSON should have name "Verdict"

   ${simpleData} `;
  const result = await model.generateContent(prompt);
  return result.response.text();
}
