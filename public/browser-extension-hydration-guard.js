(function () {
  "use strict";

  var attributeName = "bis_skin_checked";

  function clean(root) {
    if (!root) return;

    if (root.nodeType === 1 && root.hasAttribute(attributeName)) {
      root.removeAttribute(attributeName);
    }

    if (root.querySelectorAll) {
      root
        .querySelectorAll("[" + attributeName + "]")
        .forEach(function (element) {
          element.removeAttribute(attributeName);
        });
    }
  }

  clean(document.documentElement);

  var observer = new MutationObserver(function (records) {
    records.forEach(function (record) {
      if (record.type === "attributes") {
        record.target.removeAttribute(attributeName);
      }

      record.addedNodes.forEach(clean);
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [attributeName],
    childList: true,
    subtree: true,
  });

  window.addEventListener(
    "load",
    function () {
      window.setTimeout(function () {
        clean(document);
        observer.disconnect();
      }, 1000);
    },
    { once: true },
  );
})();
