/**
 * 获取utc时间
 */
function getUTCDate() {
  return new Date().toISOString();
}


/**
 * 获取通用参数
 */
function getCommonData() {
  return {
    "c_ewallet_member": memidGet(),
    "source": "电子钱包积分商城",
    "date": getUTCDate(),
    "targetId": "Tiens_ewallet",
    "targetName": "电子钱包H5",
    "identityType": "c_ewallet_member",
    "identityValue": memidGet()
  };
}

/**
 * 登录埋点的方法 1
 */
function loginTracker() {
  if (clab_tracker) {
    clab_tracker.track("c_enter_shop", getCommonData());
  }
}

/**
 * 进入商城 1
 */
function shopEnterTracker() {
  clab_tracker.ready(function () {
    var trackData = getCommonData();
    trackData["channelname"] = "电子钱包积分商城";

    this.push({});
    this.track("c_enter_shop", trackData);
  });
}

/**
 * 关键词搜索
 * @param {*} keywords   关键字
 */
function searchTracker(keywords) {

  clab_tracker.ready(function () {
    var trackData = getCommonData();
    trackData["keywords"] = keywords;

    this.push({});
    this.track("c_search_keywords", trackData);
  });
}

/**
 * 商城_点击分类  1
 * @param {*} cateName1   分类id
 */
function categoryTracker(cateName1) {

  clab_tracker.ready(function () {
    var trackData = getCommonData();
    trackData["channelname"] = "电子钱包积分商城";
    trackData["cateName1"] = cateName1;

    this.push({});
    this.track("c_click_category", trackData);
  });
}

/**
 * 点击广告位 1
 * @param {*} adspace   广告位置
 * @param {*} adTtitle   广告标题
 * @param {*} author   作者
 * @param {*} tag   内容标签
 */
function adbannerTracker(adspace, adTtitle, author, tag) {

  if (clab_tracker) {
    var trackData = getCommonData();
    trackData["adspace"] = adspace;
    trackData["adTtitle"] = adTtitle;
    trackData["author"] = author;
    trackData["tag"] = tag;

    clab_tracker.track("c_click_adbanner", trackData);
  }
}

/**
 * 猜您喜欢 1
 * @param {*} proid_recommend   推荐商品编号
 * @param {*} proName_recommend   推荐商品名称
 * @param {*} cateName1   一级商品品类
 * @param {*} cateName2   二级商品品类
 * @param {*} cateName3   三级商品品类
 */
function recommendationTracker(proid_recommend, proName_recommend, cateName1, cateName2, cateName3) {
  if (clab_tracker) {
    var trackData = getCommonData();
    trackData["channelname"] = "电子钱包积分商城";
    trackData["proid_recommend"] = proid_recommend;
    trackData["proName_recommend"] = proName_recommend;
    trackData["cateName1"] = cateName1;
    trackData["cateName2"] = cateName2;
    trackData["cateName3"] = cateName3;

    clab_tracker.track("c_click_recommendation", trackData);
  }
}

/**
 * 商城_浏览商品  1
 * @param {*} cateName1   一级商品品类
 * @param {*} cateName2   二级商品品类
 * @param {*} cateName3   三级商品品类
 * @param {*} brandName   品牌名称
 * @param {*} productId   商品编号
 * @param {*} productName   商品名称
 * @param {*} browsetime   浏览秒数
 */
function browseProductTracker(cateName1, cateName2, cateName3, brandName, productId, productName, browsetime) {
  clab_tracker.ready(function () {
    var trackData = getCommonData();

    trackData["channelname"] = "电子钱包积分商城";
    trackData["cateName1"] = cateName1;
    trackData["cateName2"] = cateName2;
    trackData["cateName3"] = cateName3;
    trackData["brandName"] = brandName;
    trackData["productId"] = productId;
    trackData["productName"] = productName;
    trackData["browsetime"] = browsetime;

    this.push({});
    this.track("c_shop_browse_product", trackData);
  });
}

/**
 * 商城_点击立即购买  1
 * @param {*} cateName1   一级商品品类
 * @param {*} cateName2   二级商品品类
 * @param {*} cateName3   三级商品品类
 * @param {*} brandName   品牌名称
 * @param {*} productId   商品编号
 * @param {*} productName   商品名称
 */
function shopnowTracker(cateName1, cateName2, cateName3, brandName, productId, productName) {
  if (clab_tracker) {
    var trackData = getCommonData();

    trackData["channelname"] = "电子钱包积分商城";
    trackData["cateName1"] = cateName1;
    trackData["cateName2"] = cateName2;
    trackData["cateName3"] = cateName3;
    trackData["brandName"] = brandName;
    trackData["productId"] = productId;
    trackData["productName"] = productName;

    clab_tracker.track("c_shop_now", trackData);
  }
}

/**
 * 商城_加入购物车
 * @param {*} cateName1   一级商品品类
 * @param {*} cateName2   二级商品品类
 * @param {*} cateName3   三级商品品类
 * @param {*} brandName   品牌名称
 * @param {*} productId   商品编号
 * @param {*} productName   商品名称
 */
function addshopcartTracker(cateName1, cateName2, cateName3, brandName, productId, productName) {
  if (clab_tracker) {
    var trackData = getCommonData();

    trackData["channelname"] = "电子钱包积分商城";
    trackData["cateName1"] = cateName1;
    trackData["cateName2"] = cateName2;
    trackData["cateName3"] = cateName3;
    trackData["brandName"] = brandName;
    trackData["productId"] = productId;
    trackData["productName"] = productName;

    clab_tracker.track("c_add_shop_cart", trackData);
  }
}

/**
 * 商城_点击购物车  1
 */
function shopshowcartTracker() {
  if (clab_tracker) {
    var trackData = getCommonData();
    trackData["channelname"] = "电子钱包积分商城";

    clab_tracker.track("c_shop_show_cart", trackData);
  }
}

/**
 * 商城_点击结算   1
 */
function clicksettlementTracker() {
  if (clab_tracker) {
    var trackData = getCommonData();
    trackData["channelname"] = "电子钱包积分商城";

    clab_tracker.track("c_click_settlement", trackData);
  }
}

/**
 * 商城点击提交订单 1
 */
function ordersubmitTracker() {
  if (clab_tracker) {
    var trackData = getCommonData();
    trackData["channelname"] = "电子钱包积分商城";

    clab_tracker.track("c_submit_order", trackData);
  }
}

/**
 * 商城_付款  1
 */
function orderpayTracker() {
  if (clab_tracker) {
    var trackData = getCommonData();
    trackData["channelname"] = "电子钱包积分商城";

    clab_tracker.track("c_pay_for_order", trackData);
  }
}

/**
 * 商城_商品详情分享  1
 * @param {*} cateName1   一级商品品类
 * @param {*} cateName2   二级商品品类
 * @param {*} cateName3   三级商品品类
 * @param {*} brandName   品牌名称
 * @param {*} productId   商品编号
 * @param {*} productName   商品名称
 * @param {*} socialmedia   社交渠道
 */
function productshareTracker(cateName1, cateName2, cateName3, brandName, productId, productName, socialmedia) {
  if (clab_tracker) {
    var trackData = getCommonData();

    trackData["channelname"] = "电子钱包积分商城";
    trackData["cateName1"] = cateName1;
    trackData["cateName2"] = cateName2;
    trackData["cateName3"] = cateName3;
    trackData["brandName"] = brandName;
    trackData["productId"] = productId;
    trackData["productName"] = productName;
    trackData["socialmedia"] = socialmedia;

    clab_tracker.track("c_share_product", trackData);
  }
}

/**
 * 商城_商品评价
 * @param {*} cateName1   一级商品品类
 * @param {*} cateName2   二级商品品类
 * @param {*} cateName3   三级商品品类
 * @param {*} brandName   品牌名称
 * @param {*} productId   商品编号
 * @param {*} productName   商品名称
 * @param {*} score   评价分数
 */
function productevaluateTracker(cateName1, cateName2, cateName3, brandName, productId, productName, score) {
  if (clab_tracker) {
    var trackData = getCommonData();

    trackData["channelname"] = "电子钱包积分商城";
    trackData["cateName1"] = cateName1;
    trackData["cateName2"] = cateName2;
    trackData["cateName3"] = cateName3;
    trackData["brandName"] = brandName;
    trackData["productId"] = productId;
    trackData["productName"] = productName;
    trackData["score"] = score;

    clab_tracker.track("c_evaluate_product", trackData);
  }
}

/**
 * 商城_商品追加评价
 * @param {*} cateName1   一级商品品类
 * @param {*} cateName2   二级商品品类
 * @param {*} cateName3   三级商品品类
 * @param {*} brandName   品牌名称
 * @param {*} productId   商品编号
 * @param {*} productName   商品名称
 * @param {*} evaluation   追加描述
 */
function productevaluateappendTracker(cateName1, cateName2, cateName3, brandName, productId, productName, evaluation) {
  if (clab_tracker) {
    var trackData = getCommonData();

    trackData["channelname"] = "电子钱包积分商城";
    trackData["cateName1"] = cateName1;
    trackData["cateName2"] = cateName2;
    trackData["cateName3"] = cateName3;
    trackData["brandName"] = brandName;
    trackData["productId"] = productId;
    trackData["productName"] = productName;
    trackData["evaluation"] = evaluation;

    clab_tracker.track("c_append_evaluate_product", trackData);
  }
}

/**
 * 申请售后
 * @param {*} cateName1   一级商品品类
 * @param {*} cateName2   二级商品品类
 * @param {*} cateName3   三级商品品类
 * @param {*} brandName   品牌名称
 * @param {*} productId   商品编号
 * @param {*} productName   商品名称
 * @param {*} type   追加描述
 * @param {*} reason   追加描述
 * @param {*} note   追加描述
 */
function aftersaleTracker(cateName1, cateName2, cateName3, brandName, productId, productName, type, reason, note) {
  if (clab_tracker) {
    var trackData = getCommonData();

    trackData["channelname"] = "电子钱包积分商城";
    trackData["cateName1"] = cateName1;
    trackData["cateName2"] = cateName2;
    trackData["cateName3"] = cateName3;
    trackData["brandName"] = brandName;
    trackData["productId"] = productId;
    trackData["productName"] = productName;
    trackData["type"] = type;
    trackData["reason"] = reason;
    trackData["note"] = note;

    clab_tracker.track("c_apply_for after_sale", trackData);
  }
}