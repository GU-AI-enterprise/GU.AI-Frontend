import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default withNextIntl(nextConfig);
