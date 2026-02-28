import { JobDetailPage } from "@/components/job-detail-page";

type JobRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobRoute({ params }: JobRouteProps) {
  const { id } = await params;

  return <JobDetailPage jobId={id} />;
}
