import Form from "@/components/Form";
import Wrapper from "@/components/ui/Wrapper";

export default function Home() {
  return (
    <div className="flex flex-col flex-grow p-4 mt-12 h-full">
      <div className="flex flex-col md:flex-row w-full mx-auto flex-grow">
        <div className="flex w-full md:w-1/2 ">
          <Form />
        </div>
        <div className="flex w-full md:w-1/2 p-4">
          <Wrapper>
            <h2 className="text-xl font-semibold mb-2">
              Welcome to <span className="text-secondary">SPECTOP:</span> Your
              AI-Powered Laptop Comparison Tool
            </h2>
            <p>
              Discover the perfect laptop tailored to your needs with SPECTOP,
              an advanced AI comparison platform that simplifies the
              decision-making process. Whether you are a student, a
              professional, or a gaming enthusiast, our AI analyzes and compares
              laptops from Amazon India, ensuring you find the best fit for your
              requirements.
            </p>
            <div className="text-secondary mt-2">
              NOTE: Please ensure that the laptops you compare are listed on{" "}
              <a href="https://www.amazon.in" className="underline">
                amazon.in
              </a>{" "}
              or
              <a href="https://flipkart.com" className="underline">
                flipkart.com
              </a>{" "}
              for accurate results.
            </div>
            <div className="text-secondary mt-2">
              IT TAKES AROUND 1 MINUTE FOR THE RESULTS TO BE DISPLAYED SO SIT
              BACK
            </div>
          </Wrapper>
        </div>
      </div>
    </div>
  );
}
