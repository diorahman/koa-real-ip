/* eslint-env mocha */

// The middleware
const realIp = require('..')

const Koa = require('koa')
const request = require('supertest')

describe('integration', () => {
  let app

  describe('proxy = true', () => {
    before(() => {
      app = new Koa()
      app.proxy = true
      app.use(realIp())
      app.use((ctx) => {
        ctx.body = ctx.request.ip
      })
    })

    it('removes local ip', () => {
      return request(app.listen())
        .get('/')
        .set('X-Forwarded-For', '192.168.1.1, 8.8.8.8')
        .expect(200)
        .expect('8.8.8.8')
    })

    it('removes aws ip', function () {
      return request(app.listen())
        .get('/')
        .set('X-Forwarded-For', '54.254.132.133, 8.8.8.8')
        .expect(200)
        .expect('8.8.8.8')
    })

    it('removes aws and local ips', function () {
      return request(app.listen())
        .get('/')
        .set('X-Forwarded-For', '192.168.1.1, 54.254.132.133, 8.8.8.8')
        .expect(200)
        .expect('8.8.8.8')
    })
  })

  describe('proxy = false', function () {
    before(function () {
      app = new Koa()
      app.use(realIp())
      app.use((ctx) => {
        ctx.body = ctx.request.ip
      })
    })

    it('removes the local ip', function () {
      return request(app.listen())
        .get('/')
        .set('X-Forwarded-For', '192.168.1.1, 8.8.8.8')
        .expect(200)
        .expect('8.8.8.8')
    })

    it('removes aws ip', function () {
      return request(app.listen())
        .get('/')
        .set('X-Forwarded-For', '54.254.132.133, 8.8.8.8')
        .expect(200)
        .expect('8.8.8.8')
    })

    it('removes aws and local ips', function () {
      return request(app.listen())
        .get('/')
        .set('X-Forwarded-For', '192.168.1.1, 54.254.132.133, 8.8.8.8')
        .expect(200)
        .expect('8.8.8.8')
    })
  })
})
