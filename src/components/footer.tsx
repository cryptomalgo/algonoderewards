import CopyButton from "@/components/copy-to-clipboard.tsx";

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-4 lg:px-8">
        <p className="mt-8 text-center text-sm/6 text-gray-600 md:order-1 md:mt-0">
          Brought to you by{" "}
          <a href={"https://x.com/cryptomalgo"} className={"text-blue-500"}>
            @cryptomalgo
          </a>
        </p>
        <p className="mt-8 text-center text-sm/6 text-gray-600 md:order-1 md:mt-0">
          ☕️ If you like this website, you can buy me a coffee by sending some
          Algo to{" "}
          <span className={"inline-flex items-center gap-1"}>
            <strong>noderewards.algo</strong>{" "}
            <CopyButton small address={"noderewards.algo"} />
          </span>
        </p>

        <p className="mt-4 text-center text-sm/6 text-gray-600 md:order-1">
          Data kindly provided by{" "}
          <a className={"text-blue-500"} href={"https://nodely.io/"}>
            Nodely
          </a>
        </p>

        <p className="mt-4 text-center text-sm/6 text-gray-500 md:order-1">
          Not affiliated with The Algorand Foundation or any other entity.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
