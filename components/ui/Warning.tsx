import Button from "./Button";
import Wrapper from "@/components/ui/Wrapper";
import { useRouter } from "next/navigation";

interface WarningProps {
  warningText: string;
}
const Warning = ({ warningText }: WarningProps) => {
  const router = useRouter();
  return (
    <div>
      <Wrapper>
        <div className="p-4">
          <div className="p-2">{warningText}</div>
          <div className="items-center p-2 mt-2 flex justify-center">
            <Button label="Cancel" onClick={() => router.push("/")} />
          </div>
        </div>
      </Wrapper>
    </div>
  );
};
export default Warning;
