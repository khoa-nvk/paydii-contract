
import { Clarinet, Tx, Chain, Account, types,TxTransfer } from 'https://deno.land/x/clarinet@v0.31.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';


const contractName = "paydii";
const contractPrincipal = (deployer: Account) =>
  `${deployer.address}.${contractName}`;
// CONTRACT ERROR
const ERR_NOT_CONTRACT_OWNER = 401;
const ERR_PRODUCT_ID_EXIST = 700;
const ERR_NOT_PRODUCT_OWNER = 701;
const ERR_NOT_FOUND_PRODUCT_ID = 702
const ERR_PRODUCT_IS_INACTIVE = 703
const ERR_CAN_NOT_BUY_YOUR_OWN_PRODUCT = 704
const ERR_CAN_NOT_BUY_YOUR_THIS_PRODUCT_TWICE = 705

const ERR_CAN_NOT_REVIEW_PRODUCT_YOU_DONT_BUY = 706
const ERR_ALREADY_REVIEW_THIS_PRODUCT = 708

const ERR_COUPON_CODE_EXIST = 710

const ERR_COUPON_ALL_USED = 805

const PRODUCT_ID_1 = "p1";
const PRODUCT_ID_2 = "p2";
const COUPON_50_OFF = "OFF50"


const PRODUCT_ID_INACTIVE = "inactive_product";
const REVIEW_ID = "review1";
const FEE = (99/100);




Clarinet.test(
    {
    name: "create product successfully",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        // Get the deployer account.
   
        let wallet1 = accounts.get("wallet_1")!;
           // Mine a few contract calls to count-up
        let block = chain.mineBlock(
            [
         Tx.contractCall(contractName, "create-product",
         [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
         types.utf8("this is description"),types.ascii("img.png"),
          types.uint(10000000), types.bool(true)], wallet1.address),
      ]);

      let [createProduct] = block.receipts;
      // Assert that the returned result is a boolean true.
      createProduct.result.expectOk().expectBool(true);    
    },
    },    
);

Clarinet.test(
  {
  name: "create product fail because using the exist product's ID",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let wallet1 = accounts.get("wallet_1")!;
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractName, "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),

        // create second product with the same id 
        Tx.contractCall(contractName, "create-product", [types.ascii(PRODUCT_ID_1),types.ascii("product 2 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),
            
      
      ]);
    let [firstProduct, secondProduct] = block.receipts;
    // Assert that the returned result is a boolean true.
    firstProduct.result.expectOk().expectBool(true);    
    secondProduct.result.expectErr().expectUint(ERR_PRODUCT_ID_EXIST)
  },
  },    
);

Clarinet.test(
  {
  name: "update product fail because of not product owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractName, "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),

        // update this product from other wallet
       Tx.contractCall(contractName, "update-product",  
       [types.ascii(PRODUCT_ID_1),types.ascii("product 2 name updated"),
       types.utf8("this is description updated"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet2.address),
      ]);
    let [createProduct, updateProductFromOtherWallet] = block.receipts;
    // Assert that the returned result is a boolean true.
    createProduct.result.expectOk().expectBool(true);   
    updateProductFromOtherWallet.result.expectErr().expectUint(ERR_NOT_PRODUCT_OWNER)
  },
  },    
);

Clarinet.test(
  {
  name: "update product fail because of not found product id",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractName, "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),

         // update a not exist product 
       Tx.contractCall(contractName, "update-product",  
       [types.ascii(PRODUCT_ID_2),types.ascii("product 2 name updated"),
       types.utf8("this is description updated"),types.ascii("img.png"),types.uint(10000000), types.bool(true)], wallet1.address),
      ]);
    let [createProduct, notFoundProduct] = block.receipts;
    // Assert that the returned result is a boolean true.
    createProduct.result.expectOk().expectBool(true);   
    notFoundProduct.result.expectErr().expectUint(ERR_NOT_FOUND_PRODUCT_ID)
  },
  },    
);

Clarinet.test(
  {
  name: "update product success",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractName, "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),

        // update this product from the product's owner
       Tx.contractCall(contractName, "update-product",  
       [types.ascii(PRODUCT_ID_1),types.ascii("product 2 name updated"),
       types.utf8("this is description updated"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),
      ]);
    let [createProduct, updateProduct] = block.receipts;
    // Assert that the returned result is a boolean true.
    createProduct.result.expectOk().expectBool(true);   
    updateProduct.result.expectOk().expectBool(true);   
  },
  },    
);

Clarinet.test(
  {
  name: "buy-product fail because product is not exist",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;

      
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractPrincipal(deployer), "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),

        // wallet 2 buy a non exist product
       Tx.contractCall(contractPrincipal(deployer), "buy-product",  
       [types.ascii(PRODUCT_ID_2)], wallet2.address),


      ]);
    let [wallet1CreateProduct1, wallet2BuyProduct2 ] = block.receipts;
    wallet1CreateProduct1.result.expectOk().expectBool(true);   
    wallet2BuyProduct2.result.expectErr().expectUint(ERR_NOT_FOUND_PRODUCT_ID);  
  },
  },    
);
Clarinet.test(
  {
  name: "buy-product fail because double buying 1 product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;

      
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractPrincipal(deployer), "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),

        // wallet 2 this product
       Tx.contractCall(contractPrincipal(deployer), "buy-product",  
       [types.ascii(PRODUCT_ID_1)], wallet2.address),

       // wallet 2 this product one more time
       Tx.contractCall(contractPrincipal(deployer), "buy-product",  
       [types.ascii(PRODUCT_ID_1)], wallet2.address),


      ]);
    let [wallet1CreateProduct1, wallet2BuyProduct2, wallet2BuyProductAgain ] = block.receipts;
    wallet1CreateProduct1.result.expectOk().expectBool(true);   
    wallet2BuyProduct2.result.expectOk().expectBool(true);  
    wallet2BuyProductAgain.result.expectErr().expectUint(ERR_CAN_NOT_BUY_YOUR_THIS_PRODUCT_TWICE);  
  },
  },    
);

Clarinet.test(
  {
  name: "buy-product fail because product is inactive ",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
       
        // wallet 1 create an inactive product
        Tx.contractCall(contractName, "create-product",
        [types.ascii(PRODUCT_ID_INACTIVE),types.ascii("product 1 name"),
        types.utf8("this is description"),types.ascii("img.png"),
         types.uint(10000000), types.bool(false)], wallet1.address),

        // wallet 2 buy an inactive product
        Tx.contractCall(contractPrincipal(deployer), "buy-product",  
        [types.ascii(PRODUCT_ID_INACTIVE)], wallet2.address)


      ]);
    let [ wallet1CreateInActiveProduct, wallet2BuyInActiveProduct] = block.receipts;
    // Assert that the returned result is a boolean true. 
    wallet1CreateInActiveProduct.result.expectOk().expectBool(true);  
    wallet2BuyInActiveProduct.result.expectErr().expectUint(ERR_PRODUCT_IS_INACTIVE)
  },
  },    
);

Clarinet.test(
  {
  name: "buy-product fail because of self-buying",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractName, "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),

         // wallet 1 self-buying its product
         Tx.contractCall(contractPrincipal(deployer), "buy-product",  
         [types.ascii(PRODUCT_ID_1)], wallet1.address),


      ]);
    let [wallet1CreateProduct1, wallet1SelfBuyingItsProduct] = block.receipts;
    // Assert that the returned result is a boolean true.
    wallet1CreateProduct1.result.expectOk().expectBool(true);   
    wallet1SelfBuyingItsProduct.result.expectErr().expectUint(ERR_CAN_NOT_BUY_YOUR_OWN_PRODUCT)
  },
  },    
);

Clarinet.test(
  {
  name: "buy-product success",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;

      const PRODUCT_PRICE = 1000000;
      const PRODUCT_PRICE_UINT = types.uint(PRODUCT_PRICE);
      
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractPrincipal(deployer), "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
       PRODUCT_PRICE_UINT, types.bool(true)], wallet1.address),

        // wallet 2 buy product
       Tx.contractCall(contractPrincipal(deployer), "buy-product",  
       [types.ascii(PRODUCT_ID_1)], wallet2.address),


      ]);
    let [wallet1CreateProduct1, wallet2BuyProduct2 ] = block.receipts;
    wallet1CreateProduct1.result.expectOk().expectBool(true);   
    wallet2BuyProduct2.result.expectOk().expectBool(true);   
    // check post condidtion
    let [buyerToContractTransfer, contractToSellerTransfer ] = wallet2BuyProduct2.events
      
      // console.log(buyerToContractTransfer)
      // {
      // type: "stx_transfer_event",
      // stx_transfer_event: {
      //   sender: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
      //   recipient: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.paydii",
      //   amount: "10000000"
      // }
    assertEquals(Number(buyerToContractTransfer.stx_transfer_event.amount),PRODUCT_PRICE)
    assertEquals(buyerToContractTransfer.stx_transfer_event.sender,wallet2.address)
    assertEquals(buyerToContractTransfer.stx_transfer_event.recipient,contractPrincipal(deployer))

    assertEquals(Number(contractToSellerTransfer.stx_transfer_event.amount),PRODUCT_PRICE * FEE)
    assertEquals(contractToSellerTransfer.stx_transfer_event.sender,contractPrincipal(deployer))
    assertEquals(contractToSellerTransfer.stx_transfer_event.recipient,wallet1.address)

    
    
  },
  },    
);

Clarinet.test(
  {
  name: "buy-product-with-coupon fail because this coupon is all used ",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractName, "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),

         // wallet 1 create a coupon 
        Tx.contractCall(contractPrincipal(deployer), "create-coupon",  
         [types.ascii(PRODUCT_ID_1), types.ascii(COUPON_50_OFF),types.uint(0), types.uint(50),types.bool(true)], wallet1.address),
         
        Tx.contractCall(contractPrincipal(deployer), "buy-product-with-coupon",  
         [types.ascii(PRODUCT_ID_1), types.ascii(COUPON_50_OFF)], wallet2.address),
  


      ]);
    let [createProduct, createCoupon, buyProductWithCoupon] = block.receipts;
    // Assert that the returned result is a boolean true.
    createProduct.result.expectOk().expectBool(true);   
    createCoupon.result.expectOk().expectBool(true);
    buyProductWithCoupon.result.expectErr().expectUint(ERR_COUPON_ALL_USED)
  },
  },    
);

Clarinet.test(
  {
  name: "buy-product-with-coupon percentage type success",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
      
      const PRODUCT_PRICE = 10000000;
      const PRODUCT_PRICE_UINT = types.uint(PRODUCT_PRICE);
      const COUPON_VALUE = 5000 // basic points 50%
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractName, "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(PRODUCT_PRICE), types.bool(true)], wallet1.address),

         // wallet 1 create a coupon 
        Tx.contractCall(contractPrincipal(deployer), "create-coupon",  
         [types.ascii(PRODUCT_ID_1), types.ascii(COUPON_50_OFF),types.uint(10), types.uint(COUPON_VALUE),types.bool(true)], wallet1.address),
         
        Tx.contractCall(contractPrincipal(deployer), "buy-product-with-coupon",  
         [types.ascii(PRODUCT_ID_1), types.ascii(COUPON_50_OFF)], wallet2.address),
  


      ]);
    let [createProduct, createCoupon, buyProductWithCoupon] = block.receipts;
    // Assert that the returned result is a boolean true.
    createProduct.result.expectOk().expectBool(true);   
    createCoupon.result.expectOk().expectBool(true);
    buyProductWithCoupon.result.expectOk().expectBool(true);

    let [buyerToContractTransfer, contractToSellerTransfer ] = buyProductWithCoupon.events
      
    
      // {
      // type: "stx_transfer_event",
      // stx_transfer_event: {
      //   sender: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
      //   recipient: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.paydii",
      //   amount: "10000000"
      // }
    let priceAfterDiscount: number =  PRODUCT_PRICE - ((PRODUCT_PRICE * COUPON_VALUE) / 10000)
    
    assertEquals(Number(buyerToContractTransfer.stx_transfer_event.amount),priceAfterDiscount)
    assertEquals(buyerToContractTransfer.stx_transfer_event.sender,wallet2.address)
    assertEquals(buyerToContractTransfer.stx_transfer_event.recipient,contractPrincipal(deployer))

    assertEquals(Number(contractToSellerTransfer.stx_transfer_event.amount),priceAfterDiscount * FEE)
    assertEquals(contractToSellerTransfer.stx_transfer_event.sender,contractPrincipal(deployer))
    assertEquals(contractToSellerTransfer.stx_transfer_event.recipient,wallet1.address)
  },
  },    
);

Clarinet.test(
  {
  name: "buy-product-with-coupon actual-amount type success",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
      
      const PRODUCT_PRICE = 10000000;
      const PRODUCT_PRICE_UINT = types.uint(PRODUCT_PRICE);
      const COUPON_VALUE = 5000 // basic points 50%
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractName, "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(PRODUCT_PRICE), types.bool(true)], wallet1.address),

         // wallet 1 create a coupon with percentage: false 
        Tx.contractCall(contractPrincipal(deployer), "create-coupon",  
         [types.ascii(PRODUCT_ID_1), types.ascii(COUPON_50_OFF),types.uint(10), types.uint(COUPON_VALUE),types.bool(false)], wallet1.address),
         
        Tx.contractCall(contractPrincipal(deployer), "buy-product-with-coupon",  
         [types.ascii(PRODUCT_ID_1), types.ascii(COUPON_50_OFF)], wallet2.address),
      ]);
    let [createProduct, createCoupon, buyProductWithCoupon] = block.receipts;
    // Assert that the returned result is a boolean true.
    createProduct.result.expectOk().expectBool(true);   
    createCoupon.result.expectOk().expectBool(true);
    buyProductWithCoupon.result.expectOk().expectBool(true);

    let [buyerToContractTransfer, contractToSellerTransfer ] = buyProductWithCoupon.events
      // {
      // type: "stx_transfer_event",
      // stx_transfer_event: {
      //   sender: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
      //   recipient: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.paydii",
      //   amount: "10000000"
      // }
    let priceAfterDiscount: number =  PRODUCT_PRICE - COUPON_VALUE;
    assertEquals(Number(buyerToContractTransfer.stx_transfer_event.amount),priceAfterDiscount)
    assertEquals(buyerToContractTransfer.stx_transfer_event.sender,wallet2.address)
    assertEquals(buyerToContractTransfer.stx_transfer_event.recipient,contractPrincipal(deployer))

    assertEquals(Number(contractToSellerTransfer.stx_transfer_event.amount),priceAfterDiscount * FEE)
    assertEquals(contractToSellerTransfer.stx_transfer_event.sender,contractPrincipal(deployer))
    assertEquals(contractToSellerTransfer.stx_transfer_event.recipient,wallet1.address)
  },
  },    
);

Clarinet.test(
  {
  name: "create-coupon fail because of non-exist product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractName, "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),

         // wallet 1 create a coupon 
         Tx.contractCall(contractPrincipal(deployer), "create-coupon",  
         [types.ascii(PRODUCT_ID_2), types.ascii(COUPON_50_OFF),types.uint(1), types.uint(50),types.bool(true)], wallet1.address),


      ]);
    let [createProduct, createCoupon] = block.receipts;
    
    createProduct.result.expectOk().expectBool(true);   
    createCoupon.result.expectErr().expectUint(ERR_NOT_FOUND_PRODUCT_ID)
  },
  },    
);
Clarinet.test(
  {
  name: "create-coupon fail because of not the product's owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractName, "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),

         // wallet 1 create a coupon 
         Tx.contractCall(contractPrincipal(deployer), "create-coupon",  
         [types.ascii(PRODUCT_ID_1), types.ascii(COUPON_50_OFF),types.uint(1), types.uint(50),types.bool(true)], wallet2.address),


      ]);
    let [createProduct, createCoupon] = block.receipts;
    
    createProduct.result.expectOk().expectBool(true);   
    createCoupon.result.expectErr().expectUint(ERR_NOT_PRODUCT_OWNER)
  },
  },    
);
Clarinet.test(
  {
  name: "create-coupon fail because of coupon's code is exist",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractName, "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),

         // wallet 1 create a coupon 
         Tx.contractCall(contractPrincipal(deployer), "create-coupon",  
         [types.ascii(PRODUCT_ID_1), types.ascii(COUPON_50_OFF),types.uint(1), types.uint(50),types.bool(true)], wallet1.address),

         // wallet 1 create a coupon again
         Tx.contractCall(contractPrincipal(deployer), "create-coupon",  
         [types.ascii(PRODUCT_ID_1), types.ascii(COUPON_50_OFF),types.uint(1), types.uint(50),types.bool(true)], wallet1.address),


      ]);
    let [createProduct, createCoupon, createCouponAgain] = block.receipts;
    
    createProduct.result.expectOk().expectBool(true);   
    createCoupon.result.expectOk().expectBool(true);   
    createCouponAgain.result.expectErr().expectUint(ERR_COUPON_CODE_EXIST)

  },
  },    
);

Clarinet.test(
  {
  name: "create-coupon success",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractName, "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),

         // wallet 1 create a coupon 
         Tx.contractCall(contractPrincipal(deployer), "create-coupon",  
         [types.ascii(PRODUCT_ID_1), types.ascii(COUPON_50_OFF),types.uint(1), types.uint(50),types.bool(true)], wallet1.address),


      ]);
    let [createProduct, createCoupon] = block.receipts;
    
    createProduct.result.expectOk().expectBool(true);   
    createCoupon.result.expectOk().expectBool(true);   
  },
  },    
);

Clarinet.test(
  {
  name: "update-coupon fail because not the product's owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractName, "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),

         // wallet 1 create a coupon 
         Tx.contractCall(contractPrincipal(deployer), "create-coupon",  
         [types.ascii(PRODUCT_ID_1), types.ascii(COUPON_50_OFF),types.uint(1), types.uint(50),types.bool(true)], wallet1.address),

         // update a coupon 
         Tx.contractCall(contractPrincipal(deployer), "update-coupon",  
         [types.ascii(PRODUCT_ID_1), types.ascii(COUPON_50_OFF),types.uint(1), types.uint(50),types.bool(false)], wallet2.address),


      ]);
    let [createProduct, createCoupon, updateCoupon] = block.receipts;
    
    createProduct.result.expectOk().expectBool(true);   
    createCoupon.result.expectOk().expectBool(true);   
    updateCoupon.result.expectErr().expectUint(ERR_NOT_PRODUCT_OWNER)
  },
  },    
);

Clarinet.test(
  {
  name: "update-coupon success",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractName, "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
        types.uint(10000000), types.bool(true)], wallet1.address),

         // wallet 1 create a coupon 
         Tx.contractCall(contractPrincipal(deployer), "create-coupon",  
         [types.ascii(PRODUCT_ID_1), types.ascii(COUPON_50_OFF),types.uint(1), types.uint(50),types.bool(true)], wallet1.address),

         // update a coupon 
         Tx.contractCall(contractPrincipal(deployer), "update-coupon",  
         [types.ascii(PRODUCT_ID_1), types.ascii(COUPON_50_OFF),types.uint(1), types.uint(50),types.bool(false)], wallet1.address),


      ]);
    let [createProduct, createCoupon, updateCoupon] = block.receipts;
    
    createProduct.result.expectOk().expectBool(true);   
    createCoupon.result.expectOk().expectBool(true);   
    updateCoupon.result.expectOk().expectBool(true);
  },
  },    
);

Clarinet.test(
  {
  name: "add-review fail because of non-exist product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;

      const PRODUCT_PRICE = 1000000;
      const PRODUCT_PRICE_UINT = types.uint(PRODUCT_PRICE);
      
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractPrincipal(deployer), "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
       PRODUCT_PRICE_UINT, types.bool(true)], wallet1.address),

        // wallet 2 buy a non exist product
       Tx.contractCall(contractPrincipal(deployer), "buy-product",  
       [types.ascii(PRODUCT_ID_1)], wallet2.address),

       Tx.contractCall(contractPrincipal(deployer), "add-review",  
       [types.ascii(PRODUCT_ID_2),types.ascii("good product"),types.uint(5)], wallet2.address),


      ]);
    let [wallet1CreateProduct1, wallet2BuyProduct2, wallet2AddReview ] = block.receipts;
    wallet1CreateProduct1.result.expectOk().expectBool(true);   
    wallet2BuyProduct2.result.expectOk().expectBool(true);   
    wallet2AddReview.result.expectErr().expectUint(ERR_NOT_FOUND_PRODUCT_ID)
  },
  },    
);

Clarinet.test(
  {
  name: "add-review fail because double review",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;

      const PRODUCT_PRICE = 1000000;
      const PRODUCT_PRICE_UINT = types.uint(PRODUCT_PRICE);
      
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractPrincipal(deployer), "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
       PRODUCT_PRICE_UINT, types.bool(true)], wallet1.address),

        // wallet 2 buy product
       Tx.contractCall(contractPrincipal(deployer), "buy-product",  
       [types.ascii(PRODUCT_ID_1)], wallet2.address),

       // wallet 2 add-review
       Tx.contractCall(contractPrincipal(deployer), "add-review",  
       [types.ascii(PRODUCT_ID_1),types.ascii("good product"),types.uint(5)], wallet2.address),

       // wallet 2 double review
       Tx.contractCall(contractPrincipal(deployer), "add-review",  
       [types.ascii(PRODUCT_ID_1),types.ascii("good product"),types.uint(5)], wallet2.address),


      ]);
    let [wallet1CreateProduct1, wallet2BuyProduct2, wallet2AddReview, wallet2AddAnotherReview] = block.receipts;
    wallet1CreateProduct1.result.expectOk().expectBool(true);   
    wallet2BuyProduct2.result.expectOk().expectBool(true);   
    wallet2AddReview.result.expectOk().expectBool(true);   
    wallet2AddAnotherReview.result.expectErr().expectUint(ERR_ALREADY_REVIEW_THIS_PRODUCT);
  },
  },    
);
Clarinet.test(
  {
  name: "add-review fail because of the inactive product",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
      let wallet3 = accounts.get("wallet_3")!;

      const PRODUCT_PRICE = 1000000;
      const PRODUCT_PRICE_UINT = types.uint(PRODUCT_PRICE);
      
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractPrincipal(deployer), "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
       PRODUCT_PRICE_UINT, types.bool(true)], wallet1.address),

        // wallet 2 buy this product
       Tx.contractCall(contractPrincipal(deployer), "buy-product",  
       [types.ascii(PRODUCT_ID_1)], wallet2.address),

        // wallet 1 update the product's status to false
       Tx.contractCall(contractName, "update-product",  
       [types.ascii(PRODUCT_ID_1),types.ascii("product 2 name updated"),
       types.utf8("this is description updated"),types.ascii("img.png"),
        types.uint(10000000), types.bool(false)], wallet1.address),

        // wallet 2 add review to an inactive product
       Tx.contractCall(contractPrincipal(deployer), "add-review",  
       [types.ascii(PRODUCT_ID_1),types.ascii("good product"),types.uint(5)], wallet2.address),
        


      ]);
    let [wallet1CreateProduct1, wallet2BuyProduct2, wallet1UpdateProduct, wallet2AddReview] = block.receipts;
    wallet1CreateProduct1.result.expectOk().expectBool(true);   
    wallet2BuyProduct2.result.expectOk().expectBool(true);   
    wallet1UpdateProduct.result.expectOk().expectBool(true);   
    wallet2AddReview.result.expectErr().expectUint(ERR_PRODUCT_IS_INACTIVE);
  },
  },    
);
Clarinet.test(
  {
  name: "add-review fail because of not the buyer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;

      const PRODUCT_PRICE = 1000000;
      const PRODUCT_PRICE_UINT = types.uint(PRODUCT_PRICE);
      
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractPrincipal(deployer), "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
       PRODUCT_PRICE_UINT, types.bool(true)], wallet1.address),
        // wallet 2 add review to an inactive product
       Tx.contractCall(contractPrincipal(deployer), "add-review",  
       [types.ascii(PRODUCT_ID_1),types.ascii("good product"),types.uint(5)], wallet2.address),
        


      ]);
    let [wallet1CreateProduct1, wallet2AddReview] = block.receipts;
    wallet1CreateProduct1.result.expectOk().expectBool(true);   
    wallet2AddReview.result.expectErr().expectUint(ERR_CAN_NOT_REVIEW_PRODUCT_YOU_DONT_BUY);
  },
  },    
);

Clarinet.test(
  {
  name: "add-review success",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;

      const PRODUCT_PRICE = 1000000;
      const PRODUCT_PRICE_UINT = types.uint(PRODUCT_PRICE);
      
         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
            // create first product
       Tx.contractCall(contractPrincipal(deployer), "create-product",
       [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
       types.utf8("this is description"),types.ascii("img.png"),
       PRODUCT_PRICE_UINT, types.bool(true)], wallet1.address),

        // wallet 2 buy a product
       Tx.contractCall(contractPrincipal(deployer), "buy-product",  
       [types.ascii(PRODUCT_ID_1)], wallet2.address),

       Tx.contractCall(contractPrincipal(deployer), "add-review",  
       [types.ascii(PRODUCT_ID_1),types.ascii("good product"),types.uint(5)], wallet2.address),


      ]);
    let [wallet1CreateProduct1, wallet2BuyProduct2, wallet2AddReview ] = block.receipts;
    wallet1CreateProduct1.result.expectOk().expectBool(true);   
    wallet2BuyProduct2.result.expectOk().expectBool(true);   
    wallet2AddReview.result.expectOk().expectBool(true);   
  },
  },    
);

Clarinet.test(
  {
  name: "withdraw-fund fail because of not the contract owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      let wallet1 = accounts.get("wallet_1")!;
      let wallet2 = accounts.get("wallet_2")!;
      let receiver = accounts.get("wallet_5")!;

      const PRODUCT_PRICE = 1000000;
      const PRODUCT_PRICE_UINT = types.uint(PRODUCT_PRICE);
         // Mine a few contract calls to count-up
      let block = chain.mineBlock([

        //     // transfer to contract address 
        // Tx.transferSTX(100000000, receiver.address,contractPrincipal(deployer)),
        
      // create first product
      Tx.contractCall(contractPrincipal(deployer), "create-product",
      [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
      types.utf8("this is description"),types.ascii("img.png"),
      PRODUCT_PRICE_UINT, types.bool(true)], wallet1.address),

       // wallet 2 buy product
      Tx.contractCall(contractPrincipal(deployer), "buy-product",  
      [types.ascii(PRODUCT_ID_1)], wallet2.address),

       Tx.contractCall(contractPrincipal(deployer), "withdraw-fund",
       [types.principal(receiver.address),types.uint(1000)], wallet2.address)
       ])

    let [createProduct, buyProduct, withdraw] = block.receipts;
    createProduct.result.expectOk().expectBool(true);   
    buyProduct.result.expectOk().expectBool(true);   
    withdraw.result.expectErr().expectUint(ERR_NOT_CONTRACT_OWNER)
  },
  },    
);

Clarinet.test(
  {
  name: "withdraw-fund fail because of not enough balance",
  async fn(chain: Chain, accounts: Map<string, Account>) {
      // Get the deployer account.
      let deployer = accounts.get("deployer")!
      let receiver = accounts.get("wallet_1")!;

      let wallet3 = accounts.get("wallet_3")!;

         // Mine a few contract calls to count-up
      let block = chain.mineBlock(
          [
       Tx.contractCall(contractPrincipal(deployer), "withdraw-fund",
       [types.principal(receiver.address),types.uint(80000)], deployer.address),

      ]);
    let [ withdrawFromDeployer] = block.receipts;
    withdrawFromDeployer.result.expectErr().expectUint(1) // err u1
  },
  },    
);

Clarinet.test(
  {
  name: "withdraw-fund success",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    // Get the deployer account.
    let deployer = accounts.get("deployer")!
    let wallet1 = accounts.get("wallet_1")!;
    let wallet2 = accounts.get("wallet_2")!;
    let receiver = accounts.get("wallet_5")!;

    const PRODUCT_PRICE = 1000000;
    const PRODUCT_PRICE_UINT = types.uint(PRODUCT_PRICE);
    const WITHDRAW_AMOUNT = 100;
    
       // Mine a few contract calls to count-up
    let block = chain.mineBlock([

      //     // transfer to contract address 
      // Tx.transferSTX(100000000, receiver.address,contractPrincipal(deployer)),
      
    // create first product
    Tx.contractCall(contractPrincipal(deployer), "create-product",
    [types.ascii(PRODUCT_ID_1),types.ascii("product 1 name"),
    types.utf8("this is description"),types.ascii("img.png"),
    PRODUCT_PRICE_UINT, types.bool(true)], wallet1.address),

     // wallet 2 buy product
    Tx.contractCall(contractPrincipal(deployer), "buy-product",  
    [types.ascii(PRODUCT_ID_1)], wallet2.address),

     Tx.contractCall(contractPrincipal(deployer), "withdraw-fund",
     [types.principal(receiver.address),types.uint(WITHDRAW_AMOUNT)], deployer.address)
     ])

     let [createProduct, buyProduct, withdraw] = block.receipts;
     createProduct.result.expectOk().expectBool(true);   
     buyProduct.result.expectOk().expectBool(true);   
     withdraw.result.expectOk().expectBool(true);   

     let withdrawDetails = withdraw.events[0]
    assertEquals(Number(withdrawDetails.stx_transfer_event.amount),WITHDRAW_AMOUNT)
    assertEquals(withdrawDetails.stx_transfer_event.sender,contractPrincipal(deployer))
    assertEquals(withdrawDetails.stx_transfer_event.recipient,receiver.address)
  },
  },    
);