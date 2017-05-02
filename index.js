const isAwsIp = require('is-aws-ip')
const insubnet = require('insubnet')
const privates = [ '0.0.0.0/8', '10.0.0.0/8', '100.64.0.0/10',
  '127.0.0.0/8', '169.254.0.0/16', '172.16.0.0/12',
  '192.0.0.0/24', '192.0.0.0/29', '192.0.2.0/24',
  '192.168.0.0/16', '198.18.0.0/15', '198.51.100.0/24',
  '203.0.113.0/24', '240.0.0.0/4', '255.255.255.255/32'
]

function isPrivateIp (ip) {
  let filtered = privates.filter((privateSubnet) => {
    return insubnet.Auto(ip, privateSubnet)
  })
  return filtered.length > 0
}

// This is a hack, since the nginx RealIP module seems
// sometimes give wrong IPs.
//
// To enable this, `app.proxy` needs to be set as `true`.
module.exports = function () {
  return function (ctx, next) {
    return Promise.resolve()
            .then(function () {
              let ips = Array.isArray(ctx.request.ips) && ctx.request.ips.length > 0
                    ? ctx.request.ips : ctx.get('x-forwarded-for').split(',')

              if (ips.length > 0) {
                ips = ips.filter((ip) => {
                  let current = ip.trim()
                  return !isAwsIp(current) && !isPrivateIp(current)
                }).map((ip) => {
                  return ip.trim()
                })

                let ip = ips[0]
                ctx.request.ip = ip || ctx.request.ip
              }
              return next()
            })
  }
}
