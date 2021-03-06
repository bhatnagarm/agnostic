'use strict'

const pinoDebug = require('pino-debug')
const logger = require('pino')({level: process.env.LEVEL || 'info'})
global.config = require('config')

pinoDebug(logger, {
	auto: true,
	map: {
		'example:server': 'info',
		'pipe:*': 'debug',
		'*': 'trace'
	}
})

require('resquire')
require('make-promises-safe').abort = true

// TODO investigate 'resolve-from'

/* MRMInjection:Redis@Step1 */
const abcache = require('abstract-cache')({
	useAwait: false // Required for fastify-server-session to function correctly
	/* MRMInjection:Redis@Step2 */
})

const fastify = require('fastify')({logger: true})
const R = require('rambdax')

fastify
	/* MRMInjection:ServerSession@Step1 */
	/* MRMInjection:Redis@Step3 */
	.register(require('fastify-caching'), {cache: abcache})
	/* MRMInjection:ServerSession@Step2 */
	.register(require('fastify-sensible'))
	.register(require('fastify-blipp'))
	.register(require('fastify-auth'))
/*
 * Temporarily disabled as part of injecting Auth functionality in MRM (although all services want some kind of authentication)
	.decorate('permittedRouteSession', function(request, reply, done) {
		const role = R.path('session.role', request)
		if (role) {
			switch (role) {
				case 'user':
					done()
					break
				default:
					done(
						fastify.httpErrors.unauthorized('access level too low for route')
					)
			}
		} else {
			done(fastify.httpErrors.expectationFailed('session expired'))
		}
	})
	*/

// Routes
/* PlopInjection:routeName */

fastify.listen(3000, (err, address) => {
	if (err) {
		throw err
	}

	fastify.blipp()
	fastify.log.info(`server listening on ${address}`)
})
