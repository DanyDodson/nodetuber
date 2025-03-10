const express = require('express')
const path = require('path')

/**
 * Controllers (route handlers).
 */
/** BACKEND API CONTROLLERS **/
const accountBackendController = require('../controllers/backend/account')
const adminBackendController = require('../controllers/backend/admin')
const internalApiController = require('../controllers/backend/internalApi')
const livestreamBackendController = require('../controllers/backend/livestream')
const purchaseController = require('../controllers/backend/purchase')
const socialMediaBackendController = require('../controllers/backend/socialMedia')
const uploadingController = require('../controllers/backend/uploading')
const youtubeController = require('../controllers/backend/youtube')
const supportBackendController = require('../controllers/backend/support')

/** FRONTEND PAGE CONTROLLERS **/
const accountFrontendController = require('../controllers/frontend/account')
const adminFrontendController = require('../controllers/frontend/admin')
const channelBrowsingController = require('../controllers/frontend/channelBrowsing')
const livestreamFrontendController = require('../controllers/frontend/livestream')
const mediaBrowsingController = require('../controllers/frontend/mediaBrowsing')
const mediaPlayerController = require('../controllers/frontend/mediaPlayer')
const publicController = require('../controllers/frontend/public')
const recentActionsController = require('../controllers/frontend/recentActions')
const socialMediaFrontendController = require('../controllers/frontend/socialMedia')
const supportFrontendController = require('../controllers/frontend/support')

/** passport config **/
const passportConfig = require('../config/passport')
const authMiddleware = require('../middlewares/shared/authentication')

function fileHostRoutes(app) {
  console.log('RUNNING AS FILE HOST')

  // set res header to upload to another server
  if (process.env.ALLOW_COR == 'true') {
    app.use(function (req, res, next) {

      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With')
      res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, OPTIONS')
      res.setHeader('Cache-Control', 'no-cache')

      next()
    })
  }

  app.post('/upload', uploadingController.postFileUpload)
  // app.post('/admin/upload', authMiddleware.adminAuth, filehostController.adminUpload);

  // edit upload and thumbnails thumbnails
  app.post('/api/upload/:uniqueTag/edit', internalApiController.editUpload)
  app.post('/api/upload/:uniqueTag/thumbnail/delete', internalApiController.deleteUploadThumbnail)

  // edit channel thumbnails
  app.post('/account/profile', accountBackendController.postUpdateProfile)

  // delete channel's thumbnail
  app.post('/api/channel/thumbnail/delete', internalApiController.deleteChannelThumbnail)

  // anything that misses, return a 404
  app.get('*', function (req, res, next) {

    res.status(404)

    return res.render('error/404noheader', {
      title: 'Not Found'
    })
  })

}

function livestreamRoutes(app) {
  console.log('Running as livestream app')

  // set res header to upload to another server
  app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With')
    res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, OPTIONS')
    res.setHeader('Cache-Control', 'no-cache')

    next()
  })

  app.get('/', publicController.index)

  // routes for nginx-rtmp
  app.post('/livestream/on-live-auth', livestreamBackendController.onLiveAuth)
  app.post('/livestream/on-live-done', livestreamBackendController.onLiveDone)

  // viewing page for rtmp streams
  app.get('/live/:user', livestreamFrontendController.getLiveRTMP)

  // user's pages
  app.get('/account', passportConfig.isAuthenticated, accountFrontendController.getAccount)
  app.get('/login', accountFrontendController.getLogin)
  app.get('/logout', accountFrontendController.logout)

  app.post('/login', accountBackendController.postLogin)

  // kurento routes
  // app.get(/\/user\/(.+)\/live\/staging/, livestreamController.getStaging);
  // app.get(/\/user\/(.+)\/live/, livestreamController.getLive);

  /** redirect all routes to the pewtube.com equivalent **/
  app.get('*', function (req, res, next) {

    const frontendAppUrl = 'https://pewtube.com'

    return res.redirect(frontendAppUrl + req.path)
  })
}

function frontendRoutes(app) {
  console.log('RUNNING AS FRONTEND')

  /** publicly available routes **/
  app.get('/', publicController.index)
  app.get('/about', publicController.about)
  app.get('/termsofservice', publicController.tos)
  app.get('/privacy', publicController.privacy)
  app.get('/embed/:uniqueTag', publicController.getEmbed)
  // app.get('/contact', contactController.getContact);
  // app.post('/contact', contactController.postContact);

  /** upload APIS **/
  app.post('/upload', uploadingController.postFileUpload)
  // TODO: load properly
  // app.post('/admin/upload', authMiddleware.adminAuth, filehostController.adminUpload);

  /** channel browsing routes **/
  app.get('/channels/:page', channelBrowsingController.channels)
  app.get('/channels', channelBrowsingController.channels)

  // TODO: cache this rather than searching whole db
  app.get('/channelsBySubs', channelBrowsingController.channelsBySubs)

  // behind admin auth atm, needs to use cache
  app.get('/channelsByReacts', authMiddleware.adminAuth, channelBrowsingController.channelsByReacts)

  // media page
  app.get('/user/:channel/:media', mediaPlayerController.getMedia)

  /** user channel and individual media page */
  app.get('/user/:channel', accountFrontendController.getChannel)

  /** media browsing routes **/
  app.get('/media/recent', mediaBrowsingController.recentUploads)
  app.get('/media/recent/:page', mediaBrowsingController.recentUploads)
  app.get('/media/popular', mediaBrowsingController.popularUploads)
  app.get('/media/popular/:page', mediaBrowsingController.popularUploads)

  app.get('/media/popularByReacts', authMiddleware.plusAuth, mediaBrowsingController.popularByReacts)

  /** search functionality **/
  app.get('/search', mediaBrowsingController.search)
  app.get('/search/:page', mediaBrowsingController.search)

  /** livestream routes **/
  // app.get(/\/user\/(.+)\/live/, livestreamController.getLive);
  // app.get(/\/user\/(.+)\/live\/staging/, livestreamController.getStaging)
  // app.get('/live', livestreamController.getLive);
  // app.get('/staging', livestreamController.getStaging);

  /** recent action routes **/
  app.get('/media/recentComments/:page', authMiddleware.adminAuth, recentActionsController.recentComments)
  app.get('/media/recentComments', authMiddleware.adminAuth, recentActionsController.recentComments)
  app.get('/media/recentViews/:page', authMiddleware.adminAuth, recentActionsController.recentViews)
  app.get('/media/recentViews', authMiddleware.adminAuth, recentActionsController.recentViews)
  app.get('/media/recentReacts/:page', authMiddleware.adminAuth, recentActionsController.recentReacts)
  app.get('/media/recentReacts', authMiddleware.adminAuth, recentActionsController.recentReacts)

  /** account pages **/
  app.get('/notifications', accountFrontendController.notification)
  app.get('/login', accountFrontendController.getLogin)
  app.get('/logout', accountFrontendController.logout)
  app.get('/forgot', accountFrontendController.getForgot)
  app.get('/reset/:token', accountFrontendController.getReset)
  app.get('/confirmEmail/:token', accountFrontendController.getConfirm)

  app.get('/signup', accountFrontendController.getSignup)

  /** account api endpoints **/
  app.post('/login', accountBackendController.postLogin)
  app.post('/forgot', accountBackendController.postForgot)
  app.post('/reset/:token', accountBackendController.postReset)
  app.post('/signup', accountBackendController.postSignup)

  /** include passport here because if its a file host, route is already loaded **/
  app.post('/api/channel/thumbnail/delete', passportConfig.isAuthenticated, internalApiController.deleteChannelThumbnail)
  app.post('/api/upload/:uniqueTag/edit', passportConfig.isAuthenticated, internalApiController.editUpload)
  app.post('/api/upload/:uniqueTag/thumbnail/delete', passportConfig.isAuthenticated, internalApiController.deleteUploadThumbnail)

  /** API ENDPOINTS **/
  app.post('/api/react/:upload/:user', passportConfig.isAuthenticated, internalApiController.react)

  // TODO: why admin controller? (fix)
  app.post('/api/upload/delete', passportConfig.isAuthenticated, adminBackendController.deleteUpload)

  app.post('/api/comment', passportConfig.isAuthenticated, internalApiController.postComment)
  app.post('/api/comment/delete', passportConfig.isAuthenticated, internalApiController.deleteComment)
  app.post('/api/subscribe', passportConfig.isAuthenticated, internalApiController.subscribeEndpoint)
  app.post('/api/credit', passportConfig.isAuthenticated, internalApiController.sendUserCredit)
  app.post('/api/report', passportConfig.isAuthenticated, internalApiController.reportUpload)
  app.post('/api/user/block', passportConfig.isAuthenticated, internalApiController.blockUser)
  app.post('/api/user/unblock', passportConfig.isAuthenticated, internalApiController.unblockUser)

  // for users or siteVisitors
  app.post('/api/changeUserFilter', internalApiController.changeUserFilter)
  app.post('/api/changeUserDefaultQuality/:quality/', internalApiController.changeDefaultUserQuality)

  // purchase endpoints
  app.post('/api/purchase/plus', passportConfig.isAuthenticated, purchaseController.purchasePlus)
  app.post('/api/purchase/credit', passportConfig.isAuthenticated, purchaseController.purchaseCredits)

  /** Account Pages **/
  app.get('/account', passportConfig.isAuthenticated, accountFrontendController.getAccount)
  app.get('/account/viewHistory', passportConfig.isAuthenticated, accountFrontendController.getViewHistory)
  app.get('/account/reactHistory', passportConfig.isAuthenticated, accountFrontendController.getReactHistory)
  app.get('/account/livestreaming', passportConfig.isAuthenticated, accountFrontendController.livestreaming)

  app.get('/media/subscribed', passportConfig.isAuthenticated, accountFrontendController.subscriptions)
  app.get('/media/subscribed/:page', passportConfig.isAuthenticated, accountFrontendController.subscriptions)

  // upload page
  app.get('/upload', passportConfig.isAuthenticated, accountFrontendController.getFileUpload)

  app.get('/user/:channel/:media/edit', passportConfig.isAuthenticated, accountFrontendController.editUpload)

  // ??
  app.get('/account/unlink/:provider', passportConfig.isAuthenticated, accountFrontendController.getOauthUnlink)

  /** ACCOUNT APIS **/
  app.post('/account/password', passportConfig.isAuthenticated, accountBackendController.postUpdatePassword)
  app.post('/account/delete', passportConfig.isAuthenticated, accountBackendController.postDeleteAccount)
  app.post('/account/profile', passportConfig.isAuthenticated, accountBackendController.postUpdateProfile)
  app.post('/account/email', passportConfig.isAuthenticated, accountBackendController.postConfirmEmail)

  // save user's youtube channel id
  app.post('/account/backup', passportConfig.isAuthenticated, youtubeController.saveYouTubeChannelId)

  /** ROUTE TO MODERATE PENDING VIDEOS **/
  app.get('/pending', authMiddleware.moderatorAuth, adminFrontendController.getPending)

  app.post('/pending', authMiddleware.moderatorAuth, adminBackendController.postPending)

  // send email as admin
  app.post('/support/emails/:id/send', authMiddleware.adminAuth, supportBackendController.sendEmail)
  app.post('/support/emails/:id', authMiddleware.moderatorAuth, supportBackendController.sendResponse)

  app.get('/support/emails', authMiddleware.moderatorAuth, supportFrontendController.getReceivedEmails)
  app.get('/support/emails/:id', authMiddleware.moderatorAuth, supportFrontendController.getReceivedEmail)

  app.get('/support/reports', authMiddleware.moderatorAuth, supportFrontendController.getReports)

  /** ADMIN PAGES **/
  app.get('/admin/users', authMiddleware.adminAuth, adminFrontendController.getUsers)
  app.get('/admin/comments', authMiddleware.adminAuth, adminFrontendController.getComments)
  app.get('/admin/uploads', authMiddleware.adminAuth, adminFrontendController.getUploads)
  app.get('/admin/dailyStats', authMiddleware.adminAuth, adminFrontendController.dailyStats)
  app.get('/admin/reacts', authMiddleware.adminAuth, adminFrontendController.reacts)
  app.get('/admin/siteVisitors', authMiddleware.adminAuth, adminFrontendController.getSiteVisitors)
  app.get('/admin/siteVisitors/:id', authMiddleware.adminAuth, adminFrontendController.getSiteVisitorHistory)
  app.get('/admin/notifications', authMiddleware.adminAuth, adminFrontendController.getNotificationPage)
  app.get('/admin/adminAudit', authMiddleware.adminAuth, adminFrontendController.getAdminAudit)

  /** SOCIAL MEDIA ENDPOINTS **/
  app.get('/admin/createSocialPost', authMiddleware.adminAuth, socialMediaFrontendController.getCreateSocialPost)
  app.get('/admin/oneOffSocialPost', authMiddleware.adminAuth, socialMediaFrontendController.getOneOffSocialPost)

  app.post('/admin/createSocialPost', authMiddleware.adminAuth, socialMediaBackendController.postCreateSocialPost)
  app.post('/admin/oneOffSocialPost', authMiddleware.adminAuth, socialMediaBackendController.postOneOffSocialPost)

  /** ADMIN API ROUTES **/
  app.post('/admin/comments', authMiddleware.adminAuth, adminBackendController.postComments)
  app.post('/admin/users', authMiddleware.adminAuth, adminBackendController.postUsers)
  app.post('/admin/deleteAccount', authMiddleware.moderatorAuth, adminBackendController.deleteAccount)
  app.post('/admin/undeleteAccount', authMiddleware.moderatorAuth, adminBackendController.undeleteAccount)
  app.post('/admin/changeRatings', authMiddleware.adminAuth, adminBackendController.changeRatings)
  app.post('/admin/getUserAccounts', authMiddleware.adminAuth, adminBackendController.getUserAccounts)

  // find all ips and accounts associated
  app.post('/admin/deleteAllUsersAndBlockIps', authMiddleware.adminAuth, adminBackendController.deleteAllUsersAndBlockIps)

  app.post('/admin/siteVisitors', authMiddleware.adminAuth, adminBackendController.postSiteVisitors)
  app.post('/admin/notifications', authMiddleware.adminAuth, adminBackendController.sendNotification)

  app.get('/debug', async function (req, res, next) {
    return res.render('error/debug', {
      title: 'Debug'
    })
  })

  // anything that misses, return a 404
  app.get('*', function (req, res, next) {

    res.status(404)

    return res.render('error/404', {
      title: 'Not Found'
    })
  })

  /** Oauth/API stuff that isn't being used **/
  // /**
  //  * API examples routes.
  //  */
  // app.get('/api', internalApiController.getApi);
  // app.get('/api/stripe', internalApiController.getStripe);
  // app.post('/api/stripe', internalApiController.postStripe);
  // app.get('/api/twilio', internalApiController.getTwilio);
  // app.post('/api/twilio', internalApiController.postTwilio);
  // app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, internalApiController.getFacebook);
  // app.get('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, internalApiController.getTwitter);
  // app.post('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, internalApiController.postTwitter);

  // app.get('/auth/youtube', passport.authenticate('youtube'));
  // app.get('/auth/youtube/callback', passport.authenticate('youtube', {failureRedirect: '/account'}), (req, res) => {
  //
  //   console.log('success');
  //
  //   res.redirect('/account');
  // });
  //
  // app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email', 'public_profile']}));
  // app.get('/auth/twitter/callback', passport.authenticate('facebook', {failureRedirect: '/login'}), (req, res) => {
  //   res.redirect(req.session.returnTo || '/');
  // });
  //
  //
  // app.get('/auth/twitter', passport.authenticate('twitter'));
  // app.get('/auth/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/login'}), (req, res) => {
  //   res.redirect(req.session.returnTo || '/');
  // });
}

module.exports = {
  fileHostRoutes,
  livestreamRoutes,
  frontendRoutes
}
