/**
Rasterize formatted text, markup, and HTML content.
@version 0.1.0
@file in.scribe.js
@author James Devlin (james@indevious.com)
@license MIT
*/

( function( window, factory ) {

  // UMD trickery - https://github.com/umdjs/umd
  'use strict';
  if ( typeof define === 'function' && define.amd ) {
    define( [], factory ); // AMD
  } else if ( typeof exports === 'object' ) {
    module.exports = factory( ); // CommonJS
  } else {
    window.inscribe = factory( ); // browser global
  }

}( window, function factory( ) {

  'use strict';

  var my = function( ) {

    return {
      inscribe: function( text, ctype, ctx, opts ) {
        my[ '_render' + (ctype || 'text') ].call( this, ctx, text, opts );
      }
    };

  };

  my._rendertext = function( context, text, opts ) {

    // Lift vars and apply defaults
    var padding = opts.padding || 10
    , maxWidth = opts.maxWidth ? opts.maxWidth - (2 * padding) : 492
    , lineHeight = opts.lineHeight || 16
    , pos = [padding, padding + lineHeight]
    , measureOnly = false // future
    , lines = text.split('\n')
    , lineIdx = 0;
    
    // Process hard lines
    lines.reduce(function( unused, line, hardIdx ) {

      var words = line.split(' '), safeLine = '';
      words[0] = (opts.firstLineIndent || '   ') + words[0];

      for( var w = 0; w < words.length; w++ ) {
        var tryLine = safeLine + (safeLine.length > 0 ? ' ' : '') + words[ w ];
        var metrics = context.measureText( tryLine );
        var widthExceeded = metrics.width > maxWidth;
        if( !widthExceeded ) {
          safeLine = tryLine;
          if( w < words.length - 1 ) continue;
        }
        _paintLine( safeLine, false );
        safeLine = widthExceeded ? words[w] : '';
      }

      if( hardIdx === lines.length - 1 )
        _paintLine( safeLine, true );

    }, { });

    function _paintLine( txtLine, force ) {
      context.fillText( txtLine, pos[0], pos[1] );
      opts.lineEmitted && opts.lineEmitted( txtLine, lineIdx );
      if( ((lineIdx % opts.chunkSize) === (opts.chunkSize - 1)) || force ) {
        opts.pageEmitted && (context = opts.pageEmitted( context ));
        pos[0] = pos[1] = padding;
      }
      pos[1] += lineHeight;
      ++lineIdx;
    }

    return {
      numLines: lineIdx
    };
  };

  my._renderhtml = function ( context, text, measureOnly, opts ) {

  };

  my._renderdom = function ( context, text, measureOnly, opts ) {

  };

  return my;

}));
