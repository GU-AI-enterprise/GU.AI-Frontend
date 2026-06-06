import { redirect } from "next/navigation";

export default function StudioToolRedirect({ params }: { params: { tool: string } }) {
  redirect(`/studio?tool=${params.tool}`);
}
