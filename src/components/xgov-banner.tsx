import { useApplication } from "@/hooks/useApplication";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon } from "lucide-react";

export default function XgovBanner() {
  const APP_ID = 3249061440;
  const STATUS_VOTING = 25;

  const { data: application } = useApplication(APP_ID);
  const globalState = application?.params?.globalState;
  const statusInt = globalState?.find((item) => {
    return new TextDecoder().decode(item.key) === "status";
  })?.value.uint;

  const status: "draft" | "voting" =
    Number(statusInt) === STATUS_VOTING ? "voting" : "draft";

  return (
    <div
      className={cn(
        {
          "bg-indigo-600 text-white hover:text-slate-300 dark:bg-indigo-800":
            status === "voting",
          "dark:over:text-indigo-800 bg-gray-100 text-black hover:text-indigo-500 dark:bg-slate-800 dark:text-white":
            status === "draft",
        },
        "flex items-center justify-center gap-x-6 px-6 py-2.5 sm:px-3.5",
      )}
    >
      <p className="text-sm/6">
        <a
          href="https://xgov.algorand.co/proposal/3249061440"
          className="h inline-flex items-center gap-1 align-middle leading-none"
          target="_blank"
        >
          <strong className="font-semibold">xGov</strong>
          <svg
            viewBox="0 0 2 2"
            aria-hidden="true"
            className="mx-2 inline size-0.5 fill-current"
          >
            <circle r={1} cx={1} cy={1} />
          </svg>
          {status === "voting" &&
            "Voting is now open for our xGov proposal. Click here to vote!"}
          {status === "draft" &&
            "A proposal to the Algorand xGov platform was submitted to fund this project. Click here to review it"}
          <span>
            <ExternalLinkIcon className="relative top-[0.5px] size-3" />
          </span>
        </a>
      </p>
    </div>
  );
}
