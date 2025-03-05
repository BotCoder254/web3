const { expectRevert, BN } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const RealEstateToken = artifacts.require('RealEstateToken');

contract('RealEstateToken', (accounts) => {
  const [admin, user1, user2] = accounts;
  const propertyId = '1';
  const tokenSupply = new BN('1000000000000000000000'); // 1000 tokens
  const tokenPrice = new BN('1000000000000000000'); // 1 ETH

  let token;

  beforeEach(async () => {
    token = await RealEstateToken.new({ from: admin });
  });

  describe('Token Purchase', () => {
    beforeEach(async () => {
      // Tokenize a property first
      await token.tokenizeProperty(propertyId, tokenSupply, tokenPrice, { from: admin });
    });

    it('should allow users to buy tokens', async () => {
      const amount = new BN('100000000000000000000'); // 100 tokens
      const value = tokenPrice.mul(amount).div(new BN('1000000000000000000'));

      const tx = await token.purchaseTokens(propertyId, amount, {
        from: user1,
        value: value
      });

      // Verify the purchase
      const balance = await token.balanceOf(user1);
      expect(balance.toString()).to.equal(amount.toString());

      // Check events
      const event = tx.logs.find(log => log.event === 'TokensPurchased');
      expect(event).to.exist;
      expect(event.args.buyer).to.equal(user1);
      expect(event.args.propertyId.toString()).to.equal(propertyId);
      expect(event.args.amount.toString()).to.equal(amount.toString());
    });

    it('should not allow purchase with insufficient funds', async () => {
      const amount = new BN('100000000000000000000'); // 100 tokens
      const value = tokenPrice.mul(amount).div(new BN('1000000000000000000')).sub(new BN('1'));

      await expectRevert(
        token.purchaseTokens(propertyId, amount, {
          from: user1,
          value: value
        }),
        'Insufficient payment'
      );
    });

    it('should not allow purchase more than available supply', async () => {
      const amount = tokenSupply.add(new BN('1'));
      const value = tokenPrice.mul(amount).div(new BN('1000000000000000000'));

      await expectRevert(
        token.purchaseTokens(propertyId, amount, {
          from: user1,
          value: value
        }),
        'Not enough tokens available'
      );
    });

    it('should allow multiple users to buy tokens', async () => {
      const amount = new BN('100000000000000000000'); // 100 tokens
      const value = tokenPrice.mul(amount).div(new BN('1000000000000000000'));

      // First user buys tokens
      await token.purchaseTokens(propertyId, amount, {
        from: user1,
        value: value
      });

      // Second user buys tokens
      await token.purchaseTokens(propertyId, amount, {
        from: user2,
        value: value
      });

      // Verify balances
      const balance1 = await token.balanceOf(user1);
      const balance2 = await token.balanceOf(user2);

      expect(balance1.toString()).to.equal(amount.toString());
      expect(balance2.toString()).to.equal(amount.toString());
    });

    it('should update remaining supply after purchase', async () => {
      const amount = new BN('100000000000000000000'); // 100 tokens
      const value = tokenPrice.mul(amount).div(new BN('1000000000000000000'));

      await token.purchaseTokens(propertyId, amount, {
        from: user1,
        value: value
      });

      const remainingSupply = await token.balanceOf(token.address);
      expect(remainingSupply.toString()).to.equal(tokenSupply.sub(amount).toString());
    });
  });
}); 