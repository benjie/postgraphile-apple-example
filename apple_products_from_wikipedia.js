// The following is code for generating the Apple product history data from the
// wikipedia page https://en.wikipedia.org/wiki/Timeline_of_Apple_Inc._products

let r = 0,
  rl = "";
const data = [...document.querySelectorAll(".wikitable")]
  .filter((t) => t.querySelectorAll("th").length === 4)
  .flatMap((t) =>
    [...t.querySelectorAll("tr")].slice(1).map((tr) => {
      const tds = [...tr.querySelectorAll("td")];
      if (r > 0) {
        r--;
        return {
          released: rl,
          model: tds[0]?.textContent,
          family: tds[1]?.textContent,
        };
      }
      if (tds[0].rowSpan > 1) {
        r = tds[0].rowSpan - 1;
        rl = tds[0].textContent;
      }
      return {
        released: tds[0]?.textContent,
        model: tds[1]?.textContent,
        family: tds[2]?.textContent,
      };
    })
  );
data.forEach((r) => {
  r.released = r.released.trim();
  r.model = r.model.trim();
  r.family = r.family.trim();
});
const sql = function (texts, ...vals) {
  return texts
    .map(
      (t, i) =>
        t + (i < texts.length - 1 ? vals[i]?.replace(/'/g, "''") ?? "" : "")
    )
    .join("");
};
const date = (str) => {
  try {
    return new Date(Date.parse(str)).toISOString();
  } catch (e) {
    if (str.split(" ").length === 2) {
      return date(`${str.split(" ")[0]} 1, ${str.split(" ")[1]}`);
    } else {
      console.log("Couldn't parse", str);
      return str;
    }
  }
};
copy(
  data
    .map((d) => sql`('${d.family}', '${d.model}', '${date(d.released)}')`)
    .join(",\n")
);

