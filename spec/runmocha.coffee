
runner = mocha.run()
failedTests = []

flattenTitles = (test) ->
  titles = []
  while test.parent.title
    titles.push test.parent.title
    test = test.parent
  return titles.reverse()

runner.on 'fail', (test, err) ->
  info =
    name: test.title
    result: false
    message: err.message
    stack: err.stack
    titles: flattenTitles test
  failedTests.push info

runner.on 'end', ->
  window.mochaResults = runner.stats
  window.mochaResults.reports = failedTests
