// ==UserScript==
// @name         b站搜索界面化
// @namespace    http://tampermonkey.net/
// @version      3.0.0
// @description  去掉b站首页的推荐，搜索框，热搜，广告等，只保留搜索框，搜索结果，搜索推荐
// @author       Littlefean
// @match        https://www.bilibili.com/*
// @match        https://search.bilibili.com/*
// @icon
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  /**
   *  全局配置信息
   */
  const SCRIPT_CONFIG = {
    // 休闲时间（就是可以看动态和消息的时间），从晚上 10 点到 12 点，可以修改
    enjoyTime: {
      start: 22,
      end: 24,
    },
    // 以下屏蔽的内容，来源于观看视频的右侧的推荐视频列表
    // 屏蔽的视频关键词列表，在非休闲时间下，搜索结果中会自动过滤掉这些关键词
    blockVideoTitleKeyword: [],
    // 永远屏蔽的关键词列表
    alwaysBlockVideoTitleKeyword: [
      "美女",
      "黑丝",
      "丝袜",
      "擦边",
      "男朋友",
      "男友",
      "恋爱",
      "少女",
      "女朋友",
      "女友",
      "媳妇",
      "情侣",
      "素颜",
      "绿茶",
      "老婆",
      "老公",
      "情侣",
      "哥哥",
      "害羞",
      // "弟弟",
      "姐姐",
      "闺蜜",
      "大胆的想法",
      "屁股",
      "取向",
      "妹妹",
      "萝莉",
      "仙女",
      "甜心",
    ],
  };

  console.log("开启了b站改成搜索界面的脚本");
  // 拿到当前的路由

  let isEnjoyTime = () => {
    let now = new Date();
    let hour = now.getHours();
    return (
      SCRIPT_CONFIG.enjoyTime.start <= hour &&
      hour < SCRIPT_CONFIG.enjoyTime.end
    );
  };

  /**
   * 获取当前路由的url后缀
   * 也就是去掉 “https://www.bilibili.com/”
   * @returns
   */
  let getUrlFix = () => {
    let url = window.location.href;
    url = url.replace("https://www.bilibili.com/", "");
    url = url.replace("https://search.bilibili.com/", "");
    return url;
  };

  /**
   * 选择器，不能用$，因为会与jquery冲突
   * 注意：有些时候拿不到，可能是因为页面还没加载完，可以用setTimeout
   * @param {string} selector 选择器
   * @returns {Element}
   */
  let _$ = (selector) => {
    return document.querySelector(selector);
  };

  /**
   * 将一个函数多次执行的装饰器，用以增强其功能
   * @param {function} func
   * @param {number} times
   * @returns
   */
  let runMoreTimesDecorator = function (func, times) {
    return function (...args) {
      for (let i = 0; i < times; i++) {
        setTimeout(() => {
          func(...args);
        }, 100 * i);
      }
    };
  };

  /**
   * 将一个函数一直持续执行的装饰器，用以增强其功能
   * @param {*} times
   * @returns
   */
  let runMultipleTimes = (func) => {
    return function (...args) {
      setInterval(() => {
        func(...args);
      }, 1000);
    };
  };

  /**
   * 让一个html标签取消显示
   * @param className 字符串，如 ".bili-feed4-layout"
   */
  let close = (className) => {
    let node = _$(className);
    if (node !== null) {
      if (node.style.display === "none") {
        return;
      } else {
        node.style.display = "none";
        console.log(`%c关闭${className}成功`, "color: green;");
      }
    } else {
      // console.log("close时 没有找到" + className + "元素");
    }
  };
  close = runMultipleTimes(close);

  // 清空搜索框里的输入
  function clearPlaceHolder(className) {
    try {
      _$(className).placeholder = "输入内容。。。";
    } catch (e) {
      console.log(e);
    }
  }
  clearPlaceHolder = runMoreTimesDecorator(clearPlaceHolder, 10);

  /**
   * 更新样式
   * @param {string} className
   * @param {object} style
   */
  function updateStyle(className, style) {
    let node = _$(className);
    if (node !== null) {
      for (let key in style) {
        node.style[key] = style[key];
      }
    }
  }

  // ==================
  // 以下是具体的功能实现
  // ==================

  const urlFix = getUrlFix();
  if (urlFix === "") {
    console.log("首页");
    close(".bili-feed4-layout");
    close(".header-channel-fixed");
    close(".bili-header__channel");
    close(".bili-header__banner");
    close(".trendings-double");
    close(".trending");
    close(".palette-button-wrap");
    close(".left-entry");

    // 将搜索框放到页面中间
    updateStyle(".bili-header__bar", {
      backgroundColor: "black",
      justifyContent: "center",
    });

    // 将搜索结果放到页面中间
    updateStyle(".center-search-container", {
      position: "absolute",
      top: "200px",
      width: "500px",
      left: "50%",
      marginLeft: "-250px",
    });

    // 增加标题
    let title = document.createElement("h1");
    title.innerText = "搜索你想要搜的";
    title.style.textAlign = "center";
    let centerSearchContainer = _$(".center-search-container");
    centerSearchContainer.appendChild(document.createElement("br"));
    centerSearchContainer.appendChild(title);

    // 关闭插件影响提示警告
    close(".adblock-tips");

    clearPlaceHolder(".nav-search-input");
    // 只要一点击就关闭
    _$(".nav-search-content").addEventListener("click", () => {
      clearPlaceHolder(".nav-search-input");
      // 关闭bilibili热搜
      close(".trendings-double");
    });
  } else if (urlFix.startsWith("video/BV")) {
    console.log("视频界面");
    // 关闭直播推荐
    close(".pop-live-small-mode");

    // 右侧推荐视频列表 屏蔽视频标题含有关键词的视频
    let blockVideoTitleKeyword = SCRIPT_CONFIG.blockVideoTitleKeyword;
    let alwaysBlockVideoTitleKeyword =
      SCRIPT_CONFIG.alwaysBlockVideoTitleKeyword;

    setInterval(() => {
      console.log("正在检查右侧推荐视频列表");
      let videoRecommendList = _$("#reco_list");
      if (videoRecommendList !== null) {
        const reco_list = videoRecommendList.querySelectorAll(
          ".video-page-card-small"
        );

        reco_list.forEach((item) => {
          let title = item.querySelector("p.title");
          let upName = item.querySelector("div.upname .name");
          if (title === null || upName === null) {
            return;
          }
          // 将视频标题中的空格去掉，因为b站经常有视频标题是 隔 一 个 字 一 个 空 格 的
          let titleText = title.innerText.replace(" ", "");

          if (isEnjoyTime()) {
            if (
              blockVideoTitleKeyword.some((keyword) =>
                titleText.includes(keyword)
              )
            ) {
              item.style.display = "none";
            }
          }

          if (
            alwaysBlockVideoTitleKeyword.some((keyword) =>
              titleText.includes(keyword)
            )
          ) {
            item.style.display = "none";
          }
        });
      } else {
        console.log("右侧推荐视频列表不存在");
      }
    }, 1000);
  }

  // -----------------
  // 下面是通用页面操作
  // -----------------

  // 导航栏上的“动态”和“消息”只在晚上 10 点到 12 点之间显示
  let now = new Date();
  let hour = now.getHours();

  if (
    SCRIPT_CONFIG.enjoyTime.start <= hour &&
    hour < SCRIPT_CONFIG.enjoyTime.end
  ) {
    console.log("现在是娱乐时间");
  } else {
    console.log("关闭导航栏上的“动态”和“消息”");
    setInterval(() => {
      let ul = _$("ul.right-entry");
      let liArray = ul.children;
      for (let li of liArray) {
        const entryText = li.querySelector(".right-entry-text");
        if (entryText === null) {
          continue;
        }
        if (entryText.innerText === "动态" || entryText.innerText === "消息") {
          ul.removeChild(li);
          console.log("关闭动态");
          break;
        }
      }
    }, 1000);
  }
})();
