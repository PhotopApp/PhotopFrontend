wireframes.premium = `
<img src = "../icons/premium/premiumMarket.svg" id = "premiumMarketShowcase">
<div id = "premiumBenefits">
    <div id = "premiumButtonWrapper">
      <button class = "subscribe shine" id = "premiumSub">Subscribe</button>
      <button class = "gift shine" id = "premiumGift">Gift</button>
    </div>
    <div class = "premiumBenefit">
      <img src="../icons/premium/PremiumEditPosts.svg" class="benefitImageShowcase">
      <div class="premiumBenefitTitle">Editing Content!</div>
      <div class="premiumBenefitDesc">Made a mistake? No worries with editing posts and chats!</div>  
    </div>
    <div class = "premiumBenefit">
      <img src = "../icons/premium/PremiumGIFs.svg" class = "benefitImageShowcase">
      <div class = "premiumBenefitTitle">Animated GIFs!</div>
      <div class="premiumBenefitDesc">Express yourself more freely with animated GIFs!</div>  
    </div>
    <div class = "premiumBenefit">
      <img src = "../icons/premium/PremiumGroups.svg" class = "benefitImageShowcase">
      <div class = "premiumBenefitTitle">More Groups!</div>
      <div class="premiumBenefitDesc">Join up to 75 groups instead of only 25!</div>  
    </div>
    <div class = "premiumBenefit">
      <img src = "../icons/premium/PremiumFileUploads.svg" class = "benefitImageShowcase">
      <div class = "premiumBenefitTitle">MASS Uploads!</div>
      <div class="premiumBenefitDesc">Doubled the max image upload size!</div>  
    </div>
    <div class = "premiumBenefit">
      <img src = "../icons/premium/PremiumCustomURL.svg" class = "benefitImageShowcase">
      <div class = "premiumBenefitTitle">Custom Profile URL!</div>
      <div class="premiumBenefitDesc">Style your profile with a custom URL!</div>  
    </div>
    <div class = "premiumBenefit">
      <img src = "../icons/premium/PremiumLongText.svg" class = "benefitImageShowcase">
      <div class = "premiumBenefitTitle">Longer Text!</div>
      <div class="premiumBenefitDesc">Longer posts, chats, and profile descriptions!</div>  
    </div>
    <div class="premiumBenefit">
      <img src="../icons/premium/PremiumRank.svg" class="benefitImageShowcase">
      <div class = "premiumBenefitTitle">Flex To Others!</div>
      <div class="premiumBenefitDesc">Show your Photop support to others with a special rank!</div>  
    </div>
</div>
<div id = "premTopShowcase">
  <div>
    <img src = "../icons/premium/PremTop.svg" class = "premTopShowcase">
  </div>
  <div id = "premTopSupport">
    <div id = "premiumHeader">Support the platform you love</div>
    <div id = "premiumSubText">As great as it would be, servers don't grow on trees. Photop with no advertisements or tracking mechanisms, relies on the those who purchase premium in order to keep the site up. Consider supporting Photop today!</div>
    <div id = "premiumButtonWrapper2">
      <button class = "subscribe shine" id = "premiumSub">Subscribe</button>
      <button class = "gift shine" id = "premiumGift">Gift</button>
    </div>
</div>
`;

pages.premium = async function() {
  // I made this because I was bored delete it if you want to.
  const subButton = findI("premiumSub");
  const giftButton = findI("premiumGift");

  const buyForm = `
    <input placeholder = "Card Number" class = "premiumInput premiumInputLarge">
    <div id = "premiumCardFlexData">
      <input placeholder = "CVV/CVC" class = "premiumInput">
      <input placeholder = "MM/YY" class = "premiumInput" type="date">
    </div>
    <input placeholder = "Name on Card" class = "premiumInput premiumInputLarge">
    `

  giftButton.onclick = function() {
    showPopUp("Card Info", buyForm, [["Submit", "var(--premiumColor)"]]);
  }
  subButton.onclick = function() {
    showPopUp("Card Info", buyForm, [["Submit", "var(--premiumColor)"]]);
  }
}