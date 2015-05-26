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

      // A streaming text renderer.
      inscribe: function( text, ctype, ctx, opts ) {
        my[ '_render' + (ctype || 'text') ].call( this, ctx, text, opts );
      },

      fit: function( text, ctype, ctx, opts ) {
        var maxWidth = opts.leftTop[0] - opts.rightBottom[0];
        var maxHeight = opts.leftTop[1] - opts.rightBottom[1];
        var fontSize = 0;
        do {
          fontSize++;
          ctx.font = fontSize + 'px sans-serif';
          var metrics = ctx.measureText( text );
        } while ( metrics.width <= maxWidth && metrics.height <= maxHeight );
        if( fontSize === 1 ) return false; // No rendering solution
        ctx.font = (fontSize-1) + 'px sans-serif';
        context.fillText( txtLine, pos[0], pos[1] );
      },
      // Improved wrap text drawing helper for canvas.
      // - http://stackoverflow.com/a/11361958
      // - http://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
      wrapText: function( context, text, x, y, maxWidth, lineHeight, measureOnly ) {

        var numLines = 1;
        var start_of_line = true;
        var line_partial = '';
        var try_line = '';
        var extents = [0,0];

        var lines = text.split('\n');

        for (var line_no = 0; line_no < lines.length; line_no++) {

          var words = lines[ line_no ].split(' ');
          start_of_line = true;
          line_partial = '';

          for( var w = 0; w < words.length; w++ ) {

            try_line = line_partial + (start_of_line ? "" : " ") + words[ w ];
            var metrics = context.measureText( try_line );
            if( metrics.width <= maxWidth ) {
              start_of_line = false;
              line_partial = try_line;
            }
            else {
              metrics = context.measureText( line_partial );
              if( metrics.width > extents[0] )
                extents[0] = metrics.width;
              measureOnly || context.fillText( line_partial, x, y);
              start_of_line = true;
              y += lineHeight;
              extents[1] = y;
              numLines++;
              line_partial = words[w]; // Drop the space
              metrics = context.measureText( line_partial );
              if( metrics.width <= maxWidth ) {
                start_of_line = false;
              }
              else {
                // A single word that is wider than max allowed width; TODO: letter-break
              }
            }
          }

          // Handle any remaining text
          measureOnly || context.fillText( line_partial, x, y );
          y += lineHeight;
          extents[1] = y;
        }

        return {
          numLines: numLines,
          extents: extents
        };
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
