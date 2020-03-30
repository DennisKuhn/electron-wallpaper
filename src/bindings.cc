/*
 * Copyright 2018 Robin Andersson <me@robinwassen.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "./electronwallpaper.h"
#include "./output.h"
#include <iostream>
#include <napi.h>

void AttachWindowExport(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  electronwallpaper::Output::debug("AttachWindowExport 1");

  if (info.Length() < 1) {
    electronwallpaper::Output::createError(env, "attachWindow expects one argument").ThrowAsJavaScriptException();
  } else if (!info[0].IsObject()) {
    electronwallpaper::Output::createError(env, "attachWindow expects first argument to be a window handle buffer").ThrowAsJavaScriptException();
  }

  unsigned char* windowHandleBuffer = info[0].As<Napi::Uint8Array>().Data();
  electronwallpaper::Output::debug("AttachWindowExport 2");

  electronwallpaper::AttachWindow(windowHandleBuffer, env);
  electronwallpaper::Output::debug("AttachWindowExport 3");
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "attachWindow"), Napi::Function::New(env, AttachWindowExport));
  return exports;
}

NODE_API_MODULE(module_name, Init)
