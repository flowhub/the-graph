const chai = require('chai');
const bluebird = require('bluebird');

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

// cannot be bluebird.promisified, because returns data 
function execFile(prog, args, options) {
  return new Promise((resolve, reject) =>
    child_process.execFile(prog, args, options, (err, stdout, stderr) => {
      if (err) reject(err)
      else resolve({ stdout: stdout, stderr: stderr })
    })
  )
}

function readFile(fp) {
  return new Promise((resolve, reject) =>
    fs.readFile(fp, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  )
}

//bluebird.promisifyAll(fs.readFile)(options.output)

function runRenderCli(inputGraph, options) {
    const prog = path.join(__dirname, '../bin/the-graph-render');

    //const graphPath = path.join(__dirname, 'temp/graph.json');
    options.output = path.join(__dirname, 'temp/rendered.tmp');

    var args = [ inputGraph ];
    Object.keys(options).forEach((key) => {
      args.push('--'+key);
      args.push(options[key]);
    })
    return bluebird.resolve(null).then(() => {
      //console.log('running', [prog].concat(args).join(' '));
      return execFile(prog, args)
    }).then((out) => {
      chai.expect(out.stdout).to.include('Written to');
      chai.expect(out.stdout).to.include(options.output);
      return readFile(options.output)
    }).then((data) => {
      return data
    }) 
}

function fixture(name) {
    return path.join(__dirname, 'fixtures/'+name);
}

const pb = fixture('photobooth.json');
const jpegMagic = Buffer.from([0xff, 0xd8]);
const pngMagic = Buffer.from([0x89, 0x50]);
const renderTimeout = 10*1000;

describe('the-graph-render', () => {

  before(() => {
    const tempDir = path.join(__dirname,'temp');
    bluebird.promisify(fs.access)(tempDir).catch((stats) => {
      return bluebird.promisify(fs.mkdir)(tempDir)
    });
  })

  describe('with no options', () => {
    it('should output PNG file', () => {
      return runRenderCli(pb, {}).then((out) => {
        const magic = out.slice(0, 2).toString('hex');
        chai.expect(magic).to.equal(pngMagic.toString('hex'))
      })
    }).timeout(renderTimeout)
  })

  describe('requesting JPEG', () => {
    it('should output JPEG file', () => {
      return runRenderCli(pb, { format: 'jpeg', quality: 1.0 }).then((out) => {
        const magic = out.slice(0, 2).toString('hex');
        chai.expect(magic).to.equal(jpegMagic.toString('hex'))
      })
    }).timeout(renderTimeout)
  })

  describe('requesting SVG', () => {
    it.skip('should output SVG file', () => {
      return runRenderCli(pb, { format: 'svg' }).then((out) => {
        const contents = out.toString('utf8');
        chai.expect(contents).to.include('<svg>');
      })
    }).timeout(renderTimeout)
  })

})
