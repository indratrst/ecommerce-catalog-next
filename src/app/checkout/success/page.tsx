import CheckoutSuccessClient from "./CheckoutSuccessClient";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    orderNumber?: string | string[];
    order_id?: string | string[];
    transaction_status?: string | string[];
  }>;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const params = await searchParams;
  return (
    <CheckoutSuccessClient
      orderNumber={firstValue(params.orderNumber) ?? firstValue(params.order_id) ?? ""}
      transactionStatus={firstValue(params.transaction_status)?.toLowerCase() ?? ""}
    />
  );
}
