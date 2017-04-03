export default function (app) {
  var onRoute = app.events.onRoute || []

  return {
    state: match(app.state, location.pathname),
    actions: {
      router: {
        match: match,
        go: function (_, data, actions) {
          history.pushState({}, "", data)
          actions.router.match(data)
        }
      }
    },
    events: {
      onLoad: [
        function (_, actions) {
          addEventListener("popstate", function () {
            actions.router.match(location.pathname)
          })
        }
      ],
      onRender: [
        function (state) {
          return app.view[state.router.match]
        }
      ]
    }
  }

  function match(state, data) {
    var match
    var params = {}

    for (var route in app.view) {
      var keys = []

      if (route !== "*") {
        data.replace(new RegExp("^" + route
          .replace(/\//g, "\\/")
          .replace(/:([A-Za-z0-9_]+)/g, function (_, key) {
            keys.push(key)

            return "([-A-Za-z0-9_]+)"
          }) + "/?$", "g"), function () {

            for (var i = 1; i < arguments.length - 2; i++) {
              params[keys.shift()] = arguments[i]
            }

            match = route
          })
      }

      if (match) {
        break
      }
    }

    var data = {
        match: match || "*",
        params: params
      }

    onRoute.map(function (cb) {
      cb(state, app.actions, data)
    })

    return {
      router: data
    }
  }
}


