export function decodeHtml(value: string): string {
  const document = new DOMParser().parseFromString(value, "text/html");
  return document.documentElement.textContent ?? "";
}

export function htmlToText(value: string): string {
  const document = new DOMParser().parseFromString(value, "text/html");
  document.querySelectorAll("script, style, noscript").forEach((node) => node.remove());
  return decodeHtml(document.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function firstImageInHtml(value: string, baseUrl: string): string | undefined {
  const documents = [value];
  if (/&lt;\s*img[\s>]/i.test(value)) documents.push(decodeHtml(value));
  for (const markup of documents) {
    const document = new DOMParser().parseFromString(markup, "text/html");
    for (const image of document.querySelectorAll("img")) {
      const url = image.getAttribute("src") || image.getAttribute("data-src");
      if (!url || isTrackingImage(url, image)) continue;
      try {
        return new URL(url, baseUrl).href;
      } catch {
        continue;
      }
    }
  }
  return undefined;
}

export function isTrackingImage(url: string, image?: Element): boolean {
  const dimensions = ["width", "height"].map((attribute) =>
    Number(image?.getAttribute(attribute)),
  );
  const imageText = `${url} ${image?.getAttribute("alt") ?? ""} ${image?.getAttribute("class") ?? ""}`;
  if (dimensions.some((dimension) => dimension === 1)) return true;
  return /(?:pixel|spacer|tracker|badge|1x1)/i.test(imageText);
}
