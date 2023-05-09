// SET THIS VARIABLE TO YOUR CASCADE API KEY
const apiKey = "";

const headerOneStyling =
  "background: #006666; padding: .6rem; color: white; border-radius: 7px; font-weight: bold";
const headerTwoStyling =
  "background: #003366; padding: .2rem; color: white; border-radius: 7px";

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
    `%cFound ${res.length} files matching ${sanitizedQuery}`,
    headerOneStyling
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
    //TODO
    //IMPLEMENT ALL COMPONENTS
    if (name.includes("photo-slider")) {
      console.log(
        `%c👇 Photo Slider 👇  %c${name}`,
        headerTwoStyling,
        "font-style: italic"
      );
    } else if (name.includes("hero-interior-level4")) {
      console.log(
        `%c👇 Hero Level 4 👇 %c${name}`,
        headerTwoStyling,
        "font-style: italic"
      );
    } else if (name.includes("hero-level1")) {
      console.log(
        `%c👇 Hero Level 1 👇 %c${name}`,
        headerTwoStyling,
        "font-style: italic"
      );
    } else if (name.includes("image-card-set")) {
      console.log(
        `%c👇 Image Card Set 👇 %c${name}`,
        headerTwoStyling,
        "font-style: italic"
      );
    } else if (name.includes("background-image")) {
      console.log(
        `%c👇 Background Image Feature 👇 %c${name}`,
        headerTwoStyling,
        "font-style: italic"
      );
    } else if (name.includes("visual-story-gallery")) {
      console.log(
        `%c👇 Visual Story Gallery 👇 %c${name}`,
        headerTwoStyling,
        "font-style: italic"
      );
    } else if (name.includes("testimonial")) {
      console.log(
        `%c👇 Testimonial 👇 %c${name}`,
        headerTwoStyling,
        "font-style: italic"
      );
    } else {
      console.log(
        `%c👇 Didn't match a component 👇 : %c${name}`,
        headerTwoStyling,
        "font-style: italic"
      );
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
