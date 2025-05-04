interface ExplorerLinkProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  type: "address" | "transaction" | "block";
}

const alloExplorerPrefixConfig = {
  address: "account",
  transaction: "tx",
  block: "block",
};

export function ExplorerLink({
  id,
  children,
  className,
  type,
}: ExplorerLinkProps) {
  return (
    <a
      className={className}
      target="_blank"
      href={`https://allo.info/${alloExplorerPrefixConfig[type]}/${id}`}
    >
      {children}
    </a>
  );
}
