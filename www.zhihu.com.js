// ==UserScript==
// @name     知乎首页简洁化
// @version  1
// @grant    none
// @match    https://www.zhihu.com/
// @description 对知乎的首页进行简洁化，以及关闭一些广告
// ==/UserScript==
(function () {
  "use strict";
  // 延迟执行的毫秒数
  const delayMs = 500;
  setTimeout(() => {
    console.log("开启了知乎改成搜索界面的脚本");

    /**
     * 让一个html标签取消显示
     * @param className 字符串，如 ".bili-feed4-layout"
     */
    const closeOne = (className) => {
      let node = document.querySelector(className);
      if (node !== null) {
        node.style.display = "none";
      }
    };
    let closeMany = (className) => {
      let nodes = document.querySelectorAll(className);
      console.log(nodes);
      for (const node of nodes) {
        if (node !== null) {
          node.style.display = "none";
        }
      }
    };
    // 首页的推荐内容
    closeOne(".Topstory-mainColumn");
    // 顶部搜索框默认文字会出现一些热点内容，屏蔽
    document.querySelector("#Popover1-toggle").placeholder = "搜搜问题";
    // 屏蔽点击搜索框之后出现下拉框里面的热点内容推荐
    document.querySelector(".SearchBar-tool").addEventListener("click", () => {
      closeOne(".AutoComplete-group");
    });
    // 关闭搜索后回答列表界面右侧的热点内容推荐
    closeOne(".TopSearch .TopSearch-items");
    // 关闭回答内容界面右侧的广告
    closeMany(".AdvertImg");
  }, delayMs);
})();
