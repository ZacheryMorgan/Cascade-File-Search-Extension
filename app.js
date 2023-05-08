// SET THIS VARIABLE TO YOUR CASCADE API KEY
const apiKey = "";

// onRun Create Context
chrome.runtime.onInstalled.addListener(() => {
  console.log("Cascade File Search Extension Started ✅");

  chrome.contextMenus.create({
    id: "cascade",
    title: 'Search for: "%s" in Cascade',
    contexts: ["selection"],
  });
});

// Context Menu onClick
chrome.contextMenus.onClicked.addListener((info) => createLog(info));

// Sanitize input and log results
const createLog = async (info) => {
  const query = info.selectionText;

  const underscoreRegex = /(_)/gi;
  const JpgRegex = /(.jpg)*/gi;
  const whitespaceRegex = /(\s)/gi;

  const underscorePosition = query.search(underscoreRegex);
  let sanitizedQuery = "";

  if (
    query[underscorePosition + 1] === "-" &&
    query[underscorePosition - 1] === "-"
  ) {
    sanitizedQuery = query.replace(underscoreRegex, "");
    sanitizedQuery =
      sanitizedQuery.slice(0, underscorePosition - 1) +
      sanitizedQuery.slice(underscorePosition);
  } else if (
    query[underscorePosition + 1] === "-" ||
    query[underscorePosition - 1] === "-"
  ) {
    sanitizedQuery = query.replace(underscoreRegex, "");
  } else {
    sanitizedQuery = query.replace(underscoreRegex, "-");
  }

  sanitizedQuery = sanitizedQuery.replace(JpgRegex, "");
  sanitizedQuery = sanitizedQuery.replace(whitespaceRegex, "-");

  let res = await searchCascade(sanitizedQuery);

  if (res.length === 0) {
    console.log(
      `No results found for %c${sanitizedQuery}`,
      `font-style: italic;
      font-weight: extra-bold;`
    );
    return;
  }

  console.log(
    `Found ${res.length} files matching %c${sanitizedQuery}`,
    `font-style: italic;`
  );
  res.forEach(async (file) => {
    let details = await fetch(
      `https://uncw.cascadecms.com/api/v1/read/file/_uncw.edu/${file.path.path}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    const data = await details.json();

    const name = data.asset.file.name;

    if (name.includes("photo-slider")) {
      console.log("👇Photo Slider👇");
    } else if (name.includes("hero-interior-level4")) {
      console.log("👇Hero Level 4👇");
    } else if (name.includes("hero-level1")) {
      console.log("👇Hero Level 1👇");
    } else if (name.includes("image-card-set")) {
      console.log("👇Image Card Set👇");
    } else if (name.includes("background-image")) {
      console.log("👇Background Image Feature👇");
    } else if (name.includes("visual-story-gallery")) {
      console.log("👇Visual Story Gallery👇");
    } else if (name.includes("testimonial")) {
      console.log("👇Testimonial👇");
    } else {
      console.log(`Didn't match a component: ${name}`);
    }

    console.log(
      `https://uncw.cascadecms.com/entity/open.act?id=${file.id}&type=file`
    );
  });
};

// Fetch
const searchCascade = async (query) => {
  let res = await fetch(`https://uncw.cascadecms.com/api/v1/search`, {
    body: JSON.stringify({
      searchInformation: {
        searchTerms: query,
        siteId: "9c98748fac1e00bd663033aefe3f79d5",
        searchFields: ["path", "name", "title"],
        searchTypes: ["file"],
      },
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await res.json();
  return data.matches;
};
