{
  'targets': [
    {
      'target_name': 'electron-wallpaper',
      'sources': [
        'src/bindings.cc',
        'src/output.cc',
        '<!@(node ./scripts/source-for-target.js)',
      ],
      'include_dirs': [
        '<!@(node -p "require(\'node-addon-api\').include")'
      ],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      'xcode_settings': {
        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
        'CLANG_CXX_LIBRARY': 'libc++',
        'MACOSX_DEPLOYMENT_TARGET': '10.7',
      },
      'msvs_settings': {
        'VCCLCompilerTool': { 'ExceptionHandling': 1 },
      },
      "conditions": [
        [
          'OS=="win"',
          {
            'defines': [ 'ISWIN' ],
          }
        ],
        [
          'OS=="linux"',
          {
              "cflags": [
                "<!@(pkg-config --cflags --libs gtk+-3.0)",
              ],
              'defines': [ 'ISLINUX' ],
          }
        ]
      ]
    }
  ]
}
