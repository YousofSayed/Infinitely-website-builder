export let projectsImagesObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.target?.tagName == "IMG") {
      entry.target.src = entry.target.getAttribute("project-image-src");
    }
  });
});

export function reInitProjectsImagesObserver() {
  projectsImagesObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target?.tagName == "IMG") {
        entry.target.src = entry.target.getAttribute("project-image-src");
      }
    });
  });
}

export function destroyProjectsImagesObserver() {
  if (projectsImagesObserver) {
    projectsImagesObserver.disconnect();
    projectsImagesObserver = null;
  }
}
