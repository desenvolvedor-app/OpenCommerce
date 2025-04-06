import { notFound } from 'next/navigation';

import { OrderDetail } from '@/components/account/order-detail';
import { getOrderById } from '@/services/order-service';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return <OrderDetail order={order} />;
}
