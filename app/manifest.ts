import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Meal Recovery Tracker",
    short_name: "Recovery",
    description: "Your personal recovery meal companion — stay consistent, feel great.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF8FF",
    theme_color: "#FAF8FF",
    orientation: "portrait",
    icons: [
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
