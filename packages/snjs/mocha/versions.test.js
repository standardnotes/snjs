/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
chai.use(chaiAsPromised)
const expect = chai.expect

describe('versions', () => {
  it('isRightVersionGreaterThanLeft', async () => {
    expect(isRightVersionGreaterThanLeft('0.0.0', '0.0.1')).to.equal(true)
    expect(isRightVersionGreaterThanLeft('0.0.0', '0.0.0.1')).to.equal(true)
    expect(isRightVersionGreaterThanLeft('1.0.0', '1.0.1')).to.equal(true)

    expect(isRightVersionGreaterThanLeft('0.0.1', '0.0.0')).to.equal(false)
    expect(isRightVersionGreaterThanLeft('0.1.1', '0.1.0')).to.equal(false)
    expect(isRightVersionGreaterThanLeft('1.1.1', '1.1.0')).to.equal(false)

    expect(isRightVersionGreaterThanLeft('1.1.001', '1.1.001')).to.equal(false)
  })

  it('compareSemVersions', () => {
    expect(compareSemVersions('1.0.0', '1.0.1')).to.equal(-1)
    expect(compareSemVersions('1.0.0', '1.0.0')).to.equal(0)
    expect(compareSemVersions('1.0.1', '1.0.0')).to.equal(1)
    expect(compareSemVersions('100.0.1', '2.0.15')).to.equal(1)

    expect(compareSemVersions('0.1', '0.2')).to.equal(-1)
    expect(compareSemVersions('0.1', '0.0.2')).to.equal(1)
    expect(compareSemVersions('0.0', '0.00')).to.equal(0)

    expect(compareSemVersions('2.0.01', '2.0.1')).to.equal(0)
    expect(compareSemVersions('2.0.0001', '2.0.01')).to.equal(0)

    expect(compareSemVersions('2.0.1001', '2.0.01')).to.equal(1)
    expect(compareSemVersions('2.0.1001', '2.2.01')).to.equal(-1)
  })
})
