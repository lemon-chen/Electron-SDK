﻿import { SoftwareRenderer, GlRenderer, IRenderer, CustomRenderer } from '../Renderer';
import {
  NodeRtcEngine,
  RtcStats,
  LocalVideoStats,
  RemoteVideoStats,
  RemoteAudioStats,
  RemoteVideoTransportStats,
  RemoteAudioTransportStats,
  RemoteVideoState,
  AgoraNetworkQuality,
  LastmileProbeResult,
  ClientRoleType,
  StreamType,
  ConnectionState,
  ConnectionChangeReason,
  MediaDeviceType,
  VIDEO_PROFILE_TYPE,
  TranscodingConfig,
  InjectStreamConfig,
  VoiceChangerPreset,
  AudioReverbPreset,
  LastmileProbeConfig,
  Priority,
  CameraCapturerConfiguration,
  ScreenSymbol,
  CaptureRect,
  CaptureParam,
  VideoContentHint,
  VideoEncoderConfiguration,
  UserInfo
} from './native_type';
import { EventEmitter } from 'events';
import { deprecate } from '../Utils';

const agora = require('../../build/Release/agora_node_ext');

/** @zh-cn
 * AgoraRtcEngine 类。
 */
/**
 * The AgoraRtcEngine class.
 */
class AgoraRtcEngine extends EventEmitter {
  rtcEngine: NodeRtcEngine;
  streams: Map<string, IRenderer>;
  renderMode: 1 | 2 | 3;
  customRenderer: any;
  constructor() {
    super();
    this.rtcEngine = new agora.NodeRtcEngine();
    this.initEventHandler();
    this.streams = new Map();
    this.renderMode = this._checkWebGL() ? 1 : 2;
    this.customRenderer = CustomRenderer;
  }

  /** @zh-cn
   * 设置渲染模式。该方法确定是使用 WebGL 渲染还是软件渲染。
   * @param {1|2|3} mode 渲染模式：
   * - 1：使用 WebGL 渲染
   * - 2：使用软件渲染
   * - 3：使用自定义渲染
   */
  /**
   * Decide whether to use webgl/software/custom rendering.
   * @param {1|2|3} mode:
   * - 1 for old webgl rendering.
   * - 2 for software rendering.
   * - 3 for custom rendering.
   */
  setRenderMode (mode: 1|2|3 = 1): void {
    this.renderMode = mode;
  }

  /** @zh-cn
   * 当 {@link setRenderMode} 方法中的渲染模式设置为 3 时，调用该方法可以设备自定义的渲染器。
   * customRender 是一个类.
   * @param {IRenderer} customRenderer 自定义渲染器
   */
  /**
   * Use this method to set custom Renderer when set renderMode in the 
   * {@link setRenderMode} method to 3.
   * CustomRender should be a class.
   * @param {IRenderer} customRenderer Customizes the video renderer.
   */
  setCustomRenderer(customRenderer: IRenderer) {
    this.customRenderer = customRenderer;
  }

  /** @zh-cn
   * @ignore
   */
  /**
   * @private
   * @ignore
   * check if WebGL will be available with appropriate features
   * @returns {boolean}
   */
  _checkWebGL(): boolean {
    const canvas = document.createElement('canvas');
    let gl;

    canvas.width = 1;
    canvas.height = 1;

    const options = {
      // Turn off things we don't need
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      preferLowPowerToHighPerformance: true

      // Still dithering on whether to use this.
      // Recommend avoiding it, as it's overly conservative
      // failIfMajorPerformanceCaveat: true
    };

    try {
      gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
    } catch (e) {
      return false;
    }
    if (gl) {
      return true;
    } else {
      return false;
    }
  }

  /** @zh-cn
   * @ignore
   */
  /**
   * init event handler
   * @private
   * @ignore
   */
  initEventHandler(): void {
    const self = this;

    const fire = (event: string, ...args: Array<any>) => {
      setImmediate(() => {
        this.emit(event, ...args);
      });
    };

    this.rtcEngine.onEvent('apierror', (funcName: string) => {
      console.error(`api ${funcName} failed. this is an error
              thrown by c++ addon layer. it often means sth is
              going wrong with this function call and it refused
              to do what is asked. kindly check your parameter types
              to see if it matches properly.`);
    });

    this.rtcEngine.onEvent('joinchannel', function(channel: string, uid: number, elapsed: number) {
      fire('joinedchannel', channel, uid, elapsed);
      fire('joinedChannel', channel, uid, elapsed);
    });

    this.rtcEngine.onEvent('rejoinchannel', function(channel: string, uid: number, elapsed: number) {
      fire('rejoinedchannel', channel, uid, elapsed);
      fire('rejoinedChannel', channel, uid, elapsed);
    });

    this.rtcEngine.onEvent('warning', function(warn: number, msg: string) {
      fire('warning', warn, msg);
    });

    this.rtcEngine.onEvent('error', function(err: number, msg: string) {
      fire('error', err, msg);
    });

    // this.rtcEngine.onEvent('audioquality', function(uid: number, quality: AgoraNetworkQuality, delay: number, lost: number) {
    //   fire('audioquality', uid, quality, delay, lost);
    //   fire('audioQuality', uid, quality, delay, lost);
    // });

    this.rtcEngine.onEvent('audiovolumeindication', function(
      speakers: {
        uid: number,
        volume: number
      }[],
      speakerNumber: number,
      totalVolume: number
    ) {
      if (speakers[0]) {
        fire(
          'audiovolumeindication',
          speakers[0]['uid'],
          speakers[0]['volume'],
          speakerNumber,
          totalVolume
        );
        fire(
          'audioVolumeIndication',
          speakers[0]['uid'],
          speakers[0]['volume'],
          speakerNumber,
          totalVolume
        );
      }
      fire('groupAudioVolumeIndication', speakers, speakerNumber, totalVolume);
    });

    this.rtcEngine.onEvent('leavechannel', function() {
      fire('leavechannel');
      fire('leaveChannel');
    });

    this.rtcEngine.onEvent('rtcstats', function(stats: RtcStats) {
      fire('rtcstats', stats);
      fire('rtcStats', stats);
    });

    this.rtcEngine.onEvent('localvideostats', function(stats: LocalVideoStats) {
      fire('localvideostats', stats);
      fire('localVideoStats', stats);
    });

    this.rtcEngine.onEvent('remotevideostats', function(stats: RemoteVideoStats) {
      fire('remotevideostats', stats);
      fire('remoteVideoStats', stats);
    });

    this.rtcEngine.onEvent('remoteAudioStats', function(stats: RemoteAudioStats) {
      fire('remoteAudioStats', stats);
    });

    this.rtcEngine.onEvent('remoteAudioTransportStats', function(uid: number, delay: number, lost: number, rxKBitRate: number) {
      fire('remoteAudioTransportStats', {
        uid, delay, lost, rxKBitRate
      });
    });

    this.rtcEngine.onEvent('remoteVideoTransportStats', function(uid: number, delay: number, lost: number, rxKBitRate: number) {
      fire('remoteVideoTransportStats', {
        uid, delay, lost, rxKBitRate
      });
    });

    this.rtcEngine.onEvent('audiodevicestatechanged', function(
      deviceId: string,
      deviceType: number,
      deviceState: number,
    ) {
      fire('audiodevicestatechanged', deviceId, deviceType, deviceState);
      fire('audioDeviceStateChanged', deviceId, deviceType, deviceState);
    });

    // this.rtcEngine.onEvent('audiomixingfinished', function() {
    //   fire('audiomixingfinished');
    //   fire('audioMixingFinished');
    // });

    this.rtcEngine.onEvent('audioMixingStateChanged', function(state: number, err: number) {
      fire('audioMixingStateChanged', state, err);
    });

    this.rtcEngine.onEvent('apicallexecuted', function(api: string, err: number) {
      fire('apicallexecuted', api, err);
      fire('apiCallExecuted', api, err);
    });

    this.rtcEngine.onEvent('remoteaudiomixingbegin', function() {
      fire('remoteaudiomixingbegin');
      fire('remoteAudioMixingBegin');
    });

    this.rtcEngine.onEvent('remoteaudiomixingend', function() {
      fire('remoteaudiomixingend');
      fire('remoteAudioMixingEnd');
    });

    this.rtcEngine.onEvent('audioeffectfinished', function(soundId: number) {
      fire('audioeffectfinished', soundId);
      fire('audioEffectFinished', soundId);
    });

    this.rtcEngine.onEvent('videodevicestatechanged', function(
      deviceId: string,
      deviceType: number,
      deviceState: number,
    ) {
      fire('videodevicestatechanged', deviceId, deviceType, deviceState);
      fire('videoDeviceStateChanged', deviceId, deviceType, deviceState);
    });

    this.rtcEngine.onEvent('networkquality', function(
      uid: number,
      txquality: AgoraNetworkQuality,
      rxquality: AgoraNetworkQuality
    ) {
      fire('networkquality', uid, txquality, rxquality);
      fire('networkQuality', uid, txquality, rxquality);
    });

    this.rtcEngine.onEvent('lastmilequality', function(quality: AgoraNetworkQuality) {
      fire('lastmilequality', quality);
      fire('lastMileQuality', quality);
    });

    this.rtcEngine.onEvent('lastmileProbeResult', function(result: LastmileProbeResult) {
      fire('lastmileProbeResult', result);
    });

    this.rtcEngine.onEvent('firstlocalvideoframe', function(
      width: number, height: number, elapsed: number
    ) {
      fire('firstlocalvideoframe', width, height, elapsed);
      fire('firstLocalVideoFrame', width, height, elapsed);
    });

    this.rtcEngine.onEvent('firstremotevideodecoded', function(
      uid: number,
      width: number,
      height: number,
      elapsed: number
    ) {
      fire('addstream', uid, elapsed);
      fire('addStream', uid, elapsed);
    });

    this.rtcEngine.onEvent('videosizechanged', function(
      uid: number, width: number, height: number, rotation: number
    ) {
      fire('videosizechanged', uid, width, height, rotation);
      fire('videoSizeChanged', uid, width, height, rotation);
    });

    this.rtcEngine.onEvent('firstremotevideoframe', function(
      uid: number,
      width: number,
      height: number,
      elapsed: number
    ) {
      fire('firstremotevideoframe', uid, width, height, elapsed);
      fire('firstRemoteVideoFrame', uid, width, height, elapsed);
    });

    this.rtcEngine.onEvent('userjoined', function(uid: number, elapsed: number) {
      console.log('user : ' + uid + ' joined.');
      fire('userjoined', uid, elapsed);
      fire('userJoined', uid, elapsed);
    });

    this.rtcEngine.onEvent('useroffline', function(uid: number, reason: number) {
      if (!self.streams) {
        self.streams = new Map();
        console.log('Warning!!!!!!, streams is undefined.');
        return;
      }
      self.destroyRender(uid);
      self.rtcEngine.unsubscribe(uid);
      fire('removestream', uid, reason);
      fire('removeStream', uid, reason);
    });

    this.rtcEngine.onEvent('usermuteaudio', function(uid: number, muted: boolean) {
      fire('usermuteaudio', uid, muted);
      fire('userMuteAudio', uid, muted);
    });

    this.rtcEngine.onEvent('usermutevideo', function(uid: number, muted: boolean) {
      fire('usermutevideo', uid, muted);
      fire('userMuteVideo', uid, muted);
    });

    this.rtcEngine.onEvent('userenablevideo', function(uid: number, enabled: boolean) {
      fire('userenablevideo', uid, enabled);
      fire('userEnableVideo', uid, enabled);
    });

    this.rtcEngine.onEvent('userenablelocalvideo', function(uid: number, enabled: boolean) {
      fire('userenablelocalvideo', uid, enabled);
      fire('userEnableLocalVideo', uid, enabled);
    });

    this.rtcEngine.onEvent('cameraready', function() {
      fire('cameraready');
      fire('cameraReady');
    });

    this.rtcEngine.onEvent('videostopped', function() {
      fire('videostopped');
      fire('videoStopped');
    });

    this.rtcEngine.onEvent('connectionlost', function() {
      fire('connectionlost');
      fire('connectionLost');
    });

    // this.rtcEngine.onEvent('connectioninterrupted', function() {
    //   fire('connectioninterrupted');
    //   fire('connectionInterrupted');
    // });

    // this.rtcEngine.onEvent('connectionbanned', function() {
    //   fire('connectionbanned');
    //   fire('connectionBanned');
    // });

    // this.rtcEngine.onEvent('refreshrecordingservicestatus', function(status: any) {
    //   fire('refreshrecordingservicestatus', status);
    //   fire('refreshRecordingServiceStatus', status);
    // });

    this.rtcEngine.onEvent('streammessage', function(
      uid: number,
      streamId: number,
      msg: string,
      len: number
    ) {
      fire('streammessage', uid, streamId, msg, len);
      fire('streamMessage', uid, streamId, msg, len);
    });

    this.rtcEngine.onEvent('streammessageerror', function(
      uid: number,
      streamId: number,
      code: number,
      missed: number,
      cached: number
    ) {
      fire('streammessageerror', uid, streamId, code, missed, cached);
      fire('streamMessageError', uid, streamId, code, missed, cached);
    });

    this.rtcEngine.onEvent('mediaenginestartcallsuccess', function() {
      fire('mediaenginestartcallsuccess');
      fire('mediaEngineStartCallSuccess');
    });

    this.rtcEngine.onEvent('requestchannelkey', function() {
      fire('requestchannelkey');
      fire('requestChannelKey');
    });

    this.rtcEngine.onEvent('fristlocalaudioframe', function(elapsed: number) {
      fire('firstlocalaudioframe', elapsed);
      fire('firstLocalAudioFrame', elapsed);
    });

    this.rtcEngine.onEvent('firstremoteaudioframe', function(uid: number, elapsed: number) {
      fire('firstremoteaudioframe', uid, elapsed);
      fire('firstRemoteAudioFrame', uid, elapsed);
    });

    this.rtcEngine.onEvent('firstRemoteAudioDecoded', function(uid: number, elapsed: number) {
      fire('firstRemoteAudioDecoded', uid, elapsed);
    });

    this.rtcEngine.onEvent('remoteVideoStateChanged', function(uid: number, state: RemoteVideoState) {
      fire('remoteVideoStateChanged', uid, state);
    });

    this.rtcEngine.onEvent('cameraFocusAreaChanged', function(
      x: number, y: number, width: number, height: number
    ) {
      fire('cameraFocusAreaChanged', x, y, width, height);
    });

    this.rtcEngine.onEvent('cameraExposureAreaChanged', function(
      x: number, y: number, width: number, height: number
    ) {
      fire('cameraExposureAreaChanged', x, y, width, height);
    });

    this.rtcEngine.onEvent('tokenPrivilegeWillExpire', function(token: string) {
      fire('tokenPrivilegeWillExpire', token);
    });

    this.rtcEngine.onEvent('streamPublished', function(url: string, error: number) {
      fire('streamPublished', url, error);
    });

    this.rtcEngine.onEvent('streamUnpublished', function(url: string) {
      fire('streamUnpublished', url);
    });

    this.rtcEngine.onEvent('transcodingUpdated', function() {
      fire('transcodingUpdated');
    });

    this.rtcEngine.onEvent('streamInjectStatus', function(
      url: string, uid: number, status: number
    ) {
      fire('streamInjectStatus', url, uid, status);
    });

    this.rtcEngine.onEvent('localPublishFallbackToAudioOnly', function(
      isFallbackOrRecover: boolean
    ) {
      fire('localPublishFallbackToAudioOnly', isFallbackOrRecover);
    });

    this.rtcEngine.onEvent('remoteSubscribeFallbackToAudioOnly', function(
      uid: number,
      isFallbackOrRecover: boolean
    ) {
      fire('remoteSubscribeFallbackToAudioOnly', uid, isFallbackOrRecover);
    });

    this.rtcEngine.onEvent('microphoneEnabled', function(enabled: boolean) {
      fire('microphoneEnabled', enabled);
    });

    this.rtcEngine.onEvent('connectionStateChanged', function(
      state: ConnectionState,
      reason: ConnectionChangeReason
    ) {
      fire('connectionStateChanged', state, reason);
    });

    this.rtcEngine.onEvent('activespeaker', function(uid: number) {
      fire('activespeaker', uid);
      fire('activeSpeaker', uid);
    });

    this.rtcEngine.onEvent('clientrolechanged', function(oldRole: ClientRoleType, newRole: ClientRoleType) {
      fire('clientrolechanged', oldRole, newRole);
      fire('clientRoleChanged', oldRole, newRole);
    });

    this.rtcEngine.onEvent('audiodevicevolumechanged', function(
      deviceType: MediaDeviceType,
      volume: number,
      muted: boolean
    ) {
      fire('audiodevicevolumechanged', deviceType, volume, muted);
      fire('audioDeviceVolumeChanged', deviceType, volume, muted);
    });

    this.rtcEngine.onEvent('videosourcejoinsuccess', function(uid: number) {
      fire('videosourcejoinedsuccess', uid);
      fire('videoSourceJoinedSuccess', uid);
    });

    this.rtcEngine.onEvent('videosourcerequestnewtoken', function() {
      fire('videosourcerequestnewtoken');
      fire('videoSourceRequestNewToken');
    });

    this.rtcEngine.onEvent('videosourceleavechannel', function() {
      fire('videosourceleavechannel');
      fire('videoSourceLeaveChannel');
    });

    this.rtcEngine.onEvent('localUserRegistered', function(uid:number, userAccount:string) {
      fire('localUserRegistered', uid, userAccount);
    });

    this.rtcEngine.onEvent('userInfoUpdated', function(uid:number, userInfo: UserInfo) {
      fire('userInfoUpdated', uid, userInfo);
    });

    this.rtcEngine.onEvent('localVideoStateChanged', function(localVideoState:number, err: number) {
      fire('localVideoStateChanged', localVideoState, err);
    });

    this.rtcEngine.onEvent('audioMixingStateChanged', function(state:number, errorCode: number) {
      fire('audioMixingStateChanged', state, errorCode);
    });

    this.rtcEngine.registerDeliverFrame(function(infos: any) {
      self.onRegisterDeliverFrame(infos);
    });
  }

  /** @zh-cn
   * @ignore
   */
  /**
   * @private
   * @ignore
   * @param {number} type 0-local 1-remote 2-device_test 3-video_source
   * @param {number} uid uid get from native engine, differ from electron engine's uid
   */
  _getRenderer(type: number, uid: number): IRenderer | undefined {
    if (type < 2) {
      if (uid === 0) {
        return this.streams.get('local');
      } else {
        return this.streams.get(String(uid));
      }
    } else if (type === 2) {
      // return this.streams.devtest;
      console.warn('Type 2 not support in production mode.');
      return;
    } else if (type === 3) {
      return this.streams.get('videosource');
    } else {
      console.warn('Invalid type for getRenderer, only accept 0~3.');
      return;
    }
  }

  /** @zh-cn
   * @ignore
   */
  /**
   * check if data is valid
   * @private
   * @ignore
   * @param {*} header
   * @param {*} ydata
   * @param {*} udata
   * @param {*} vdata
   */
  _checkData(
    header: ArrayBuffer,
    ydata: ArrayBuffer,
    udata: ArrayBuffer,
    vdata: ArrayBuffer,
  ) {
    if (header.byteLength != 20) {
      console.error('invalid image header ' + header.byteLength);
      return false;
    }
    if (ydata.byteLength === 20) {
      console.error('invalid image yplane ' + ydata.byteLength);
      return false;
    }
    if (udata.byteLength === 20) {
      console.error('invalid image uplanedata ' + udata.byteLength);
      return false;
    }
    if (
      ydata.byteLength != udata.byteLength * 4 ||
      udata.byteLength != vdata.byteLength
    ) {
      console.error(
        'invalid image header ' +
          ydata.byteLength +
          ' ' +
          udata.byteLength +
          ' ' +
          vdata.byteLength
      );
      return false;
    }

    return true;
  }

  /** @zh-cn
   * @ignore
   */
  /**
   * register renderer for target info
   * @private
   * @ignore
   * @param {number} infos
   */
  onRegisterDeliverFrame(infos: any) {
    const len = infos.length;
    for (let i = 0; i < len; i++) {
      const info = infos[i];
      const {
        type, uid, header, ydata, udata, vdata
      } = info;
      if (!header || !ydata || !udata || !vdata) {
        console.log(
          'Invalid data param ： ' + header + ' ' + ydata + ' ' + udata + ' ' + vdata
        );
        continue;
      }
      const renderer = this._getRenderer(type, uid);
      if (!renderer) {
        console.warn("Can't find renderer for uid : " + uid);
        continue;
      }

      if (this._checkData(header, ydata, udata, vdata)) {
        renderer.drawFrame({
          header,
          yUint8Array: ydata,
          uUint8Array: udata,
          vUint8Array: vdata,
        });
      }
    }
  }

  /** @zh-cn
   * 更新渲染尺寸。
   * 当视图尺寸发生改变时，该方法可以根据视窗尺寸长宽比更新缩放比例，在收到下一个视频帧时，按照新的比例进行渲染。
   * 该方法可以防止视图不连贯的问题。
   * @param {string|number} key 存储渲染器 Map 的关键标识，如 `uid`、`videoSource` 或 `local`
   */
  /**
   * @description Resizes the renderer.
   *
   * When the size of the view changes, this method refresh the zoom level so that video is sized
   * appropriately while waiting for the next video frame to arrive.
   * Calling this method prevents a view discontinutity.
   * @param {string|number} key Key for the map that store the renderers, e.g, `uid` or `videosource` or `local`.
   */
  resizeRender(key: 'local' | 'videosource' | number) {
    if (this.streams.has(String(key))) {
        const renderer = this.streams.get(String(key));
        if (renderer) {
          renderer.refreshCanvas();
      }
    }
  }


  /** @zh-cn
   * 初始化渲染器对象。
   * @param {string|number} key 存储渲染器 Map 的关键标识，如 `uid`、`videosource` 或 `local`
   * @param {Element} view 渲染视频的 Dom
   */
  /**
   * @description Initializes the renderer.
   * @param {string|number} key Key for the map that store the renderers, e.g, uid or `videosource` or `local`.
   * @param {Element} view The Dom elements to render the video.
   */
  initRender(key: 'local' | 'videosource' | number, view: Element) {
    if (this.streams.has(String(key))) {
      this.destroyRender(key);
    }
    let renderer: IRenderer;
    if (this.renderMode === 1) {
      renderer = new GlRenderer();
    } else if (this.renderMode === 2) {
      renderer = new SoftwareRenderer();
    } else if (this.renderMode === 3) {
      renderer = new this.customRenderer();
    } else {
      console.warn('Unknown render mode, fallback to 1');
      renderer = new GlRenderer();
    }
    renderer.bind(view);
    this.streams.set(String(key), renderer);
  }

  /** @zh-cn
   * 销毁渲染器对象。
   * @param {string|number} key 存储渲染器 Map 的关键标识，如 `uid`、`videoSource` 或 `local`
   * @param {function} onFailure `destroyRenderer` 方法的错误回调
   */
  /**
   * @description Destroys the renderer.
   * @param {string|number} key Key for the map that store the renderers, e.g, `uid` or `videosource` or `local`.
   * @param {function} onFailure The error callback for the `destroyRenderer` method.
   */
  destroyRender(key: 'local' | 'videosource' | number, onFailure?: (err: Error) => void) {
    if (!this.streams.has(String(key))) {
      return;
    }
    const renderer = this.streams.get(String(key));
    try {
      (renderer as IRenderer).unbind();
      this.streams.delete(String(key));
    } catch (err) {
      onFailure && onFailure(err);
    }
  }

  // ===========================================================================
  // BASIC METHODS
  // ===========================================================================

  /** @zh-cn
   * 初始化一个 AgoraRtcEngine 实例。
   * @param {string} appid Agora 为 App 开发者签发的 App ID，每个项目都应该有一个独一无二的 App ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Initializes the agora real-time-communicating engine with your App ID.
   * @param {string} appid The App ID issued to you by Agora.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  initialize(appid: string): number {
    return this.rtcEngine.initialize(appid);
  }

  /** @zh-cn
   * 获取当前 SDK 的版本和 Build 信息。
   * @returns {string} 当前 SDK 的版本
   */
  /**
   * @description Returns the version and the build information of the current SDK.
   * @returns {string} The version of the current SDK.
   */
  getVersion(): string {
    return this.rtcEngine.getVersion();
  }

  /** @zh-cn
   * 获取指定错误码的详细错误信息。
   * @param {number} errorCode 错误码
   * @returns {string} 错误描述
   */
  /**
   * @description Retrieves the error description.
   * @param {number} errorCode The error code.
   * @returns {string} The error description.
   */
  getErrorDescription(errorCode: number): string {
    return this.rtcEngine.getErrorDescription(errorCode);
  }

  /** @zh-cn
   * 获取当前网络连接状态。
   * @returns {ConnectionState} connect 网络连接状态，详见 {@link ConnectionState}
   */
  /**
   * @description Gets the connection state of the SDK.
   * @returns {ConnectionState} Connect states. See {@link ConnectionState}.
   */
  getConnectionState(): ConnectionState {
    return this.rtcEngine.getConnectionState();
  }

  /** @zh-cn
   * 加入频道。
   *
   * 该方法让用户加入通话频道，在同一个频道内的用户可以互相通话，多个用户加入同一个频道，可以群聊。使用不同 App ID 的 App 是不能互通的。如果已在通话中，用户必须调用 {@link leaveChannel} 退出当前通话，才能进入下一个频道。
   *
   * 成功调用该方加入频道后，本地会触发 joinedChannel 事件；通信模式下的用户和直播模式下的主播加入频道后，远端会触发 userJoined 事件。
   *
   * 在网络状况不理想的情况下，客户端可能会与 Agora 的服务器失去连接；SDK 会自动尝试重连，重连成功后，本地会触发 rejoinedChannel 事件。
   *
   * @param {string} token 在 App 服务器端生成的用于鉴权的 Token：
   * - 安全要求不高：你可以填入在 Agora Dashboard 获取到的临时 Token。详见[获取临时 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取临时-token)
   * - 安全要求高：将值设为在 App 服务端生成的正式 Token。详见[获取 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取正式-token)
   *
   * @param {string} channel （必填）标识通话频道的字符，长度在 64 个字节以内的字符串。以下为支持的字符集范围（共 89 个字符）：
   * - 26 个小写英文字母 a-z
   * - 26 个大写英文字母 A-Z
   * - 10 个数字 0-9
   * - 空格
   * - “!”, “#”, “$”, “%”, “&”, “(”, “)”, “+”, “-”, “:”, “;”, “<”, “=”, “.”, “>”, “?”, “@”, “[”, “]”, “^”, “_”, “{”, “}”, “|”, “~”, “,”
   * @param {string} info (非必选项) 开发者需加入的任何附加信息。一般可设置为空字符串，或频道相关信息。该信息不会传递给频道内的其他用户
   * @param {number} uid 用户 ID，32 位无符号整数。建议设置范围：1到 (232-1)，并保证唯一性。如果不指定（即设为 0），SDK 会自动分配一个
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Allows a user to join a channel.
   *
   * Users in the same channel can talk to each other, and multiple users in the same channel can start a group chat.
   * Users with different App IDs cannot call each other.You must call the {@link leaveChannel} method to exit the current call
   * before entering another channel.
   *
   * This method call triggers the following callbacks:
   *
   * - The local client: joinedChannel
   * - The remote client: userJoined, if the user joining the channel is in the Communication profile,
   * or is a BROADCASTER in the Live Broadcast profile.
   *
   * When the connection between the client and Agora's server is interrupted due to poor network conditions,
   * the SDK tries reconnecting to the server. When the local client successfully rejoins the channel, the SDK
   * triggers the rejoinedChannel callback on the local client.
   *
   * @param {string} token token The token generated at your server:
   * - For low-security requirements: You can use the temporary token generated at Dashboard. For details, see [Get a temporary token](https://docs.agora.io/en/Voice/token?platform=All%20Platforms#get-a-temporary-token).
   * - For high-security requirements: Set it as the token generated at your server. For details, see [Get a token](https://docs.agora.io/en/Voice/token?platform=All%20Platforms#get-a-token).
   * @param {string} channel (Required) Pointer to the unique channel name for the Agora RTC session in the string format smaller than 64 bytes. Supported characters:
   * - The 26 lowercase English letters: a to z.
   * - The 26 uppercase English letters: A to Z.
   * - The 10 numbers: 0 to 9.
   * - The space.
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @param {string} info (Optional) Pointer to additional information about the channel. This parameter can be set to NULL or contain channel related information.
   * Other users in the channel will not receive this message.
   * @param {number} uid The User ID. A 32-bit unsigned integer with a value ranging from 1 to 2<sup>32</sup>-1. The `uid` must be unique. If a `uid` is not assigned (or set to 0),
   * the SDK assigns a `uid`.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  joinChannel(token: string, channel: string, info: string, uid: number): number {
    return this.rtcEngine.joinChannel(token, channel, info, uid);
  }

  /** @zh-cn
   * 离开频道。
   *
   * 离开频道，机挂断或退出通话。当调用 {@link joinChannel} 方法后，必须调用该方法结束通话，否则无法开始下一次通话。
   * 不管当前是否在通话中，都可以调用该方法，没有副作用。该方法会把回话相关的所有资源都释放掉。该方法是异步操作，调用返回时并没有真正退出频道。
   *
   * 在真正退出频道后，本地会触发 leaveChannel 回调；通信模式下的用户和直播模式下的主播离开频道后，远端会触发 removeStream 回调。
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Allows a user to leave a channel.
   *
   * Allows a user to leave a channel, such as hanging up or exiting a call. The user must call the method to end the call before
   * joining another channel after call the {@link joinChannel} method.
   * This method returns 0 if the user leaves the channel and releases all resources related to the call.
   * This method call is asynchronous, and the user has not left the channel when the method call returns.
   *
   * Once the user leaves the channel, the SDK triggers the leavechannel callback.
   *
   * A successful leavechannel method call triggers the removeStream callback for the remote client when the user leaving the channel
   * is in the Communication channel, or is a BROADCASTER in the Live Broadcast profile.
   *
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  leaveChannel(): number {
    return this.rtcEngine.leaveChannel();
  }

  /** @zh-cn
   * 释放 AgoraRtcEngine 实例。
   *
   * 调用该方法后，用户将无法再使用和回调该 SDK 内的其它方法。如需再次使用，必须重新初始化 {@link initialize} 一个 AgoraRtcEngine 实例。
   *
   * **Note**： 该方法需要在子线程中操作。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Releases the AgoraRtcEngine instance.
   *
   * Once the App calls this method to release the created AgoraRtcEngine instance, no other methods in the SDK
   * can be used and no callbacks can occur. To start it again, initialize {@link initialize} to establish a new
   * AgoraRtcEngine instance.
   *
   * **Note**: Call this method in the subthread.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  release(): number {
    return this.rtcEngine.release();
  }

  /** @zh-cn
   * @deprecated 该方法已废弃。请改用 {@link setAudioProfile}。
   * 设置音频高音质选项。
   *
   * 请在加入频道前调用该方法，对其中的三个模式完成设置。加入频道后调用该方法不生效。
   * @param {boolean} fullband 是否启用全频带编解码器（48 kHz 采样率）：
   * - true：启用全频带编解码器
   * - false：禁用全频带编解码器
   * @param {boolean} stereo 是否启用立体声编解码器：
   * - true：启用立体声编解码器
   * - false：禁用立体声编解码器
   * @param {boolean} fullBitrate 是否启用高码率模式：
   * - true：启用高码率模式
   * - false：禁用高码率模式
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated. Agora does not recommend using this method. Use {@link setAudioProfile} instead.
   * @description Sets the high-quality audio preferences.
   *
   * Call this method and set all parameters before joining a channel.
   * @param {boolean} fullband Sets whether to enable/disable full-band codec (48-kHz sample rate).
   * - true: Enable full-band codec.
   * - false: Disable full-band codec.
   * @param {boolean} stereo Sets whether to enable/disable stereo codec.
   * - true: Enable stereo codec.
   * - false: Disable stereo codec.
   * @param {boolean} fullBitrate Sets whether to enable/disable high-bitrate mode.
   * - true: Enable high-bitrate mode.
   * - false: Disable high-bitrate mode.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setHighQualityAudioParameters(fullband: boolean, stereo: boolean, fullBitrate: boolean): number {
    deprecate('setAudioProfile');
    return this.rtcEngine.setHighQualityAudioParameters(fullband, stereo, fullBitrate);
  }

  /** @zh-cn
   * 订阅远端用户并初始化渲染器。
   *
   * @param {number} uid 想要订阅的远端用户的 ID
   * @param {Element} view 初始化渲染器的 Dom
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Subscribes to a remote user and initializes the corresponding renderer.
   * @param {number} uid The user ID of the remote user.
   * @param {Element} view The Dom where to initialize the renderer.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  subscribe(uid: number, view: Element): number {
    this.initRender(uid, view);
    return this.rtcEngine.subscribe(uid);
  }

  /** @zh-cn
   * 设置本地视图和渲染器。
   *
   * **Note**：请在主线程调用该方法。
   * @param {Element} view 初始化视图的 Dom
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the local video view and the corresponding renderer.
   * @param {Element} view The Dom element where you initialize your view.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setupLocalVideo(view: Element): number {
    this.initRender('local', view);
    return this.rtcEngine.setupLocalVideo();
  }

  /** @zh-cn
   *
   * 设置视频渲染的分辨率。
   *
   * 该方法只对发送给 js 层的视频数据有效。其他端的视频分辨率由 {@link setVideoEncoderConfiguration} 方法决定。
   * @param {number} rendertype 渲染器的类型：
   * - 0：本地渲染器
   * - 1：远端渲染器
   * - 2：设备测试
   * - 3：视频源
   * @param {number} uid 目标用户的 ID
   * @param {number} width 想要发送的视频宽度
   * @param {number} height 想要发送的视频高度
   */
  /**
   *
   * @description Sets the renderer dimension of video.
   *
   * This method ONLY affects size of data sent to js layer, while native video size is determined by {@link setVideoEncoderConfiguration}.
   * @param {*} rendertype The renderer type:
   * - 0: The local renderer.
   * - 1: The remote renderer.
   * - 2: The device test
   * - 3: The video source.
   * @param {*} uid The user ID of the targeted user.
   * @param {*} width The target width.
   * @param {*} height The target height.
   */
  setVideoRenderDimension(
    rendertype: number,
    uid: number,
    width: number,
    height: number
  ) {
    this.rtcEngine.setVideoRenderDimension(rendertype, uid, width, height);
  }

  /** @zh-cn
   * 设置视频的全局渲染帧率，单位为 fps。
   * 该方法主要用来提升 js 渲染的性能。完成设置后，视频数据会被强制按设置的帧率进行传输，以降低 js 渲染的 CPU 消耗。
   *
   * 该方法不适用于添加至高帧率传输流的视频视图。
   * @param {number} fps 渲染帧率，单位为 fps
   */
  /**
   * @description Sets the global renderer frame rate (fps).
   *
   * This method is mainly used to improve the performance of js rendering
   * once set, the video data will be sent with this frame rate. This can reduce the CPU consumption of js rendering.
   * This applies to ALL views except the ones added to the high frame rate stream.
   * @param {number} fps The renderer frame rate (fps).
   */
  setVideoRenderFPS(fps: number) {
    this.rtcEngine.setFPS(fps);
  }

  /** @zh-cn
   * 设置高帧率流的渲染帧率。其中高帧率流指调用 {@link addVideoRenderToHighFPS} 方法添加至高帧率的视频流。
   * 请注意区分高帧率流和双流模式里的大流。
   * 该方法适用于将大多数视图设置为低帧率，只将一或两路流设置为高帧率的场景，如屏幕共享。
   * @param {number} fps 渲染帧率，单位为 fps
   */
  /**
   * @description Sets renderer frame rate for the high stream.
   *
   * The high stream here has nothing to do with the dual stream.
   * It means the stream that is added to the high frame rate stream by calling the {@link addVideoRenderToHighFPS} method.
   *
   * This is often used when we want to set the low frame rate for most of views, but high frame rate for one
   * or two special views, e.g. screen sharing.
   * @param {number} fps The renderer high frame rate (fps).
   */
  setVideoRenderHighFPS(fps: number) {
    this.rtcEngine.setHighFPS(fps);
  }

  /** @zh-cn
   * 将指定用户的视频流添加为高帧率流。添加为高帧率流后，你可以调用 {@link setVideoRenderHighFPS} 方法对视频流进行控制。
   * @param {number} uid 用户 ID
   */
  /**
   * @description Adds a video stream to the high frame rate stream.
   * Streams added to the high frame rate stream will be controlled by the {@link setVideoRenderHighFPS} method.
   * @param {number} uid The User ID.
   */
  addVideoRenderToHighFPS(uid: number) {
    this.rtcEngine.addToHighVideo(uid);
  }

  /** @zh-cn
   * 将指定用户的视频从高帧率流中删除。删除后，你可以调用 {@link setVideoRenderFPS} 方法对视频流进行控制。
   * @param {number} uid 用户 ID
   */
  /**
   * @description Removes a stream from the high frame rate stream.
   * Streams removed from the high frame rate stream will be controlled by the {@link setVideoRenderFPS} method.
   * @param {number} uid The User ID.
   */
  removeVideoRenderFromHighFPS(uid: number) {
    this.rtcEngine.removeFromHighVideo(uid);
  }

  /** @zh-cn
   * 设置视窗内容显示模式。
   *
   * @param {number | 'local' | 'videosource'} uid 用户 ID，表示设置的是哪个用户的流
   * @param {0|1} mode 视窗内容显示模式：
   * - 0：优先保证视窗被填满。视频尺寸等比缩放，直至整个视窗被视频填满。如果视频长宽与显示窗口不同，多出的视频将被截掉
   * - 1： 优先保证视频内容全部显示。视频尺寸等比缩放，直至视频窗口的一边与视窗边框对齐。如果视频长宽与显示窗口不同，视窗上未被填满的区域将被涂黑
   * @returns {number}
   * - 0：方法调用成功
   * - -1：方法调用失败
   */
  /**
   * @description Sets the view content mode.
   * @param {number | 'local' | 'videosource'} uid The user ID for operating streams.
   * @param {0|1} mode The view content mode:
   * - 0: Cropped mode. Uniformly scale the video until it fills the visible boundaries (cropped). One dimension of the video may have clipped contents.
   * - 1: Fit mode. Uniformly scale the video until one of its dimension fits the boundary (zoomed to fit). Areas that are not filled due to the disparity
   * in the aspect ratio will be filled with black.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setupViewContentMode(uid: number | 'local' | 'videosource', mode: 0|1): number {
    if (this.streams.has(String(uid))) {
      const renderer = this.streams.get(String(uid));
      (renderer as IRenderer).setContentMode(mode);
      return 0;
    } else {
      return -1;
    }
  }

  /** @zh-cn
   * 更新 Token。
   *
   * 如果启用了 Token 机制，过一段时间后使用的 Token 会失效。当：
   * - warning 回调报告错误码 ERR_TOKEN_EXPIRED(109)，或
   * - requestChannelKey 回调报告错误码 ERR_TOKEN_EXPIRED(109)，或
   * - 用户收到 tokenPrivilegeWillExpire 回调时，
   * App 应重新获取 Token，然后调用该 API 更新 Token，否则 SDK 无法和服务器建立连接。
   * @param {string} newtoken 需要更新的新 Token
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Renews the token when the current token expires.
   *
   * The key expires after a certain period of time once the Token schema is enabled when:
   * - The onError callback reports the ERR_TOKEN_EXPIRED(109) error, or
   * - The requestChannelKey callback reports the ERR_TOKEN_EXPIRED(109) error, or
   * - The user receives the tokenPrivilegeWillExpire callback.
   *
   * The app should retrieve a new token from the server and then call this method to renew it. Failure to do so results in the SDK disconnecting from the server.
   * @param {string} newtoken The new token.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  renewToken(newtoken: string): number {
    return this.rtcEngine.renewToken(newtoken);
  }

  /** @zh-cn
   * 设置频道模式。
   *
   * Agora 会根据 App 的使用场景进行不同的优化。
   *
   * **Note**：
   * - 该方法必须在 {@link joinChannel} 方法之前调用
   * - 相同频道内的所有用户必须使用相同的频道模式
   *
   * @param {number} profile 频道模式：
   * - 0：通信（默认）
   * - 1：直播
   * - 2：游戏
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the channel profile.
   *
   * The AgoraRtcEngine applies different optimization according to the app scenario.
   *
   * **Note**:
   * -  Call this method before the {@link joinChannel} method.
   * - Users in the same channel must use the same channel profile.
   * @param {number} profile The channel profile:
   * - 0: for communication
   * - 1: for live broadcasting
   * - 2: for in-game
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setChannelProfile(profile: number): number {
    return this.rtcEngine.setChannelProfile(profile);
  }

  /** @zh-cn
   * 设置直播模式下的用户角色。
   *
   * 在加入频道前，用户需要通过本方法设置观众（默认）或主播模式。在加入频道后，用户可以通过本方法切换用户模式。
   *
   * 直播模式下，如果你在加入频道后调用该方法切换用户角色，调用成功后，本地会触发 clientRoleChanged 事件；远端会触发 userJoined 事件。
   * @param {ClientRoleType} role 用户角色：
   * - 1：主播
   * - 2：观众
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   *
   * @description Sets the role of a user (Live Broadcast only).
   *
   * This method sets the role of a user, such as a host or an audience (default), before joining a channel.
   *
   * This method can be used to switch the user role after a user joins a channel. In the Live Broadcast profile,
   * when a user switches user roles after joining a channel, a successful setClientRole method call triggers the following callbacks:
   * - The local client: clientRoleChanged
   * - The remote client: userJoined
   *
   * @param {ClientRoleType} role The client role:
   *
   * - 1: The broadcaster
   * - 2: The audience
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setClientRole(role: ClientRoleType): number {
    return this.rtcEngine.setClientRole(role);
  }

  /** @zh-cn
   * @deprecated 该方法已废弃。请改用 {@link startEchoTestWithInterval}。
   * 开始语音通话回路测试。
   * 该方法启动语音通话测试，目的是测试系统的音频设备（耳麦、扬声器等）和网络连接是否正常。
   * 在测试过程中，用户先说一段话，在 10 秒后，声音会回放出来。如果 10 秒后用户能正常听到自己刚才说的话，
   * 就表示系统音频设备和网络连接都是正常的。
   *
   * **Note**：
   * - 请在加入频道 {@link joinChannel} 前调用该方法
   * - 调用该方法后必须调用 {@link stopEchoTest} 已结束测试，否则不能进行下一次回声测试，也不能调用 {@link joinChannel} 进行通话。
   * - 直播模式下，该方法仅能由用户角色为主播的用户调用
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated The method is deprecated. Use {@link startEchoTestWithInterval} instead.
   * @description Starts an audio call test.
   *
   * This method launches an audio call test to determine whether the audio devices
   * (for example, headset and speaker) and the network connection are working properly.
   *
   * To conduct the test, the user speaks, and the recording is played back within 10 seconds.
   * If the user can hear the recording in 10 seconds, it indicates that the audio devices
   * and network connection work properly.
   *
   * **Note**:
   * - Call this method before the {@link joinChannel} method.
   * - After calling this method, call the {@link stopEchoTest} method to end the test. Otherwise, the app cannot run the next echo test,
   * nor can it call the {@link joinChannel} method to start a new call.
   * - In the Live Broadcast profile, only hosts can call this method.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  startEchoTest(): number {
    deprecate('startEchoTestWithInterval');
    return this.rtcEngine.startEchoTest();
  }

  /** @zh-cn
   * 停止语音通话回路测试。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops the audio call test.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  stopEchoTest(): number {
    return this.rtcEngine.stopEchoTest();
  }

  /** @zh-cn
   * 开始语音通话回路测试。
   *
   * 该方法启动语音通话测试，目的是测试系统的音频设备（耳麦、扬声器等）和网络连接是否正常。
   * 在测试过程中，用户先说一段话，声音会在设置的时间间隔（单位为秒）后回放出来。如果用户能正常听到自己刚才说的话，
   * 就表示系统音频设备和网络连接都是正常的。
   *
   * **Note**：
   * - 请在加入频道 {@link joinChannel} 前调用该方法
   * - 调用该方法后必须调用 {@link stopEchoTest} 已结束测试，否则不能进行下一次回声测试，也不能调用 {@link joinChannel} 进行通话。
   * - 直播模式下，该方法仅能由用户角色为主播的用户调用
   * @param interval 设置返回语音通话回路测试结果的时间间隔，取值范围为 [2, 10]，单位为秒，默认为 10 秒
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Starts an audio call test.
   *
   * This method starts an audio call test to determine whether the audio devices
   * (for example, headset and speaker) and the network connection are working properly.
   *
   * In the audio call test, you record your voice. If the recording plays back within the set time interval,
   * the audio devices and the network connection are working properly.
   *
   * **Note**:
   * - Call this method before the {@link joinChannel} method.
   * - After calling this method, call the {@link stopEchoTest} method to end the test. Otherwise, the app cannot run the next echo test,
   nor can it call the {@link joinChannel} method to start a new call.
   * - In the Live Broadcast profile, only hosts can call this method.
   * @param interval The time interval (s) between when you speak and when the recording plays back.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  startEchoTestWithInterval(interval: number): number {
    return this.rtcEngine.startEchoTestWithInterval(interval);
  }

  /** @zh-cn
   * 启用网络测试。
   *
   * 该方法启用网络连接质量测试，用于检测用户网络接入质量。默认该功能为关闭状态。该方法主要用于以下两种场景：
   * - 用户加入频道前，可以调用该方法判断和预测目前的上行网络质量是否足够好。
   * - 直播模式下，当用户角色想由观众切换为主播时，可以调用该方法判断和预测目前的上行网络质量是否足够好。
   *
   * 启用该方法会消耗一定的网络流量，影响通话质量。在收到 lastmileQuality 回调后，需调用 {@link stopEchoTest}
   * 方法停止测试，再加入频道或切换用户角色。
   *
   * **Note**：
   * - 该方法请勿与 {@link startLastmileProbeTest} 方法同时使用
   * - 调用该方法后，在收到 lastmileQuality 回调之前请不要调用其他方法，否则可能会由于 API 操作过于频繁导致此回调无法执行
   * - 直播模式下，主播在加入频道后，请勿调用该方法
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Enables the network connection quality test.
   *
   * This method tests the quality of the users' network connections and is disabled by default.
   *
   * Before users join a channel or before an audience switches to a host, call this method to check the uplink network quality.
   * This method consumes additional network traffic, which may affect the communication quality.
   *
   * Call the {@link disableLastmileTest} method to disable this test after receiving the lastmileQuality callback, and before the user joins a channel or switches the user role.
   * **Note**:
   * - Do not call any other methods before receiving the lastmileQuality callback. Otherwise,
   * the callback may be interrupted by other methods, and hence may not be triggered.
   * - A host should not call this method after joining a channel (when in a call).
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  enableLastmileTest(): number {
    return this.rtcEngine.enableLastmileTest();
  }

  /** @zh-cn
   * 关闭网络测试。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description This method disables the network connection quality test.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  disableLastmileTest(): number {
    return this.rtcEngine.disableLastmileTest();
  }

  /** @zh-cn
   * 开始通话前网络质量探测。
   *
   * 启用该方法后，SDK 会向用户反馈上下行网络的带宽、丢包、网络抖动和往返时延数据。SDK 会一次返回如下两个回调：
   * - lastmileQuality：视网络情况约 2 秒内返回。该回调通过打分反馈上下行网络质量，更贴近用户的主观感受。
   * - lastmileProbeResult：视网络情况约 30 秒内返回。该回调通过客观数据反馈上下行网络质量，因此更客观。
   *
   * 该方法主要用于以下两种场景：
   * - 用户加入频道前，可以调用该方法判断和预测目前的上行网络质量是否足够好。
   * - 直播模式下，当用户角色想由观众切换为主播时，可以调用该方法判断和预测目前的上行网络质量是否足够好。
   *
   * **Note**：
   * - 该方法会消耗一定的网络流量，影响通话质量，因此我们建议不要同时使用该方法和 {@link enableLastmileTest}
   * - 调用该方法后，在收到 lastmileQuality 和 lastmileProbeResult 回调之前请不用调用其他方法，否则可能会由于 API 操作过于频繁导致此方法无法执行
   * - 直播模式下，如果本地用户为主播，请勿在加入频道后调用该方法
   *
   * @param {LastmileProbeConfig} config Last-mile 网络探测配置，详见 {@link LastmileProbeConfig}
   */
  /**
   * @description Starts the last-mile network probe test before
   * joining a channel to get the uplink and downlink last-mile network statistics,
   * including the bandwidth, packet loss, jitter, and round-trip time (RTT).
   *
   * Once this method is enabled, the SDK returns the following callbacks:
   * - lastmileQuality: the SDK triggers this callback within two seconds depending on the network conditions.
   * This callback rates the network conditions with a score and is more closely linked to the user experience.
   * - lastmileProbeResult: the SDK triggers this callback within 30 seconds depending on the network conditions.
   * This callback returns the real-time statistics of the network conditions and is more objective.
   *
   * Call this method to check the uplink network quality before users join a channel or before an audience switches to a host.
   *
   * **Note**:
   * - This method consumes extra network traffic and may affect communication quality. We do not recommend calling this method together with {@link enableLastmileTest}.
   * - Do not call other methods before receiving the lastmileQuality and lastmileProbeResult callbacks. Otherwise, the callbacks may be interrupted by other methods.
   * - In the Live Broadcast profile, a host should not call this method after joining a channel.
   *
   * @param {LastmileProbeConfig} config The configurations of the last-mile network probe test. See  {@link LastmileProbeConfig}.
   */
  startLastmileProbeTest(config: LastmileProbeConfig): number {
    return this.rtcEngine.startLastmileProbeTest(config);
  }

  /** @zh-cn
   * 停止通话前 Last-mile 网络质量探测。
   *
   * @return
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops the last-mile network probe test.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  stopLastmileProbeTest(): number {
    return this.rtcEngine.stopLastmileProbeTest();
  }

  /** @zh-cn
   * 启用视频模块。
   *
   * 该方法用于打开视频模式。可以在加入频道前或者通话中调用，在加入频道前调用，则自动开启视频模式，在通话中调用则由音频模式切换为视频模式。
   * 调用 {@link disableVideo} 方法可关闭视频模式。
   *
   * 成功调用该方法后，远端会触发 userEnableVideo(true) 回调。
   *
   * **Note**：
   * - 该方法设置的是内部引擎为开启状态，在频道内和频道外均可调用，且在 {@link leaveChannel} 后仍然有效。
   * - 该方法重置整个引擎，响应速度较慢，因此 Agora 建议使用如下方法来控制视频模块：
   *
   *   - {@link enableLocalVideo}：是否启动摄像头采集并创建本地视频流
   *   - {@link muteLocalVideoStream}：是否发布本地视频流
   *   - {@link muteRemoteVideoStream}：是否接收并播放远端视频流
   *   - {@link muteAllRemoteVideoStreams}：是否接收并播放所有远端视频流
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Enables the video module.
   *
   * You can call this method either before joining a channel or during a call. If you call this method before joining a channel,
   * the service starts in the video mode. If you call this method during an audio call, the audio mode switches to the video mode.
   *
   * To disable the video, call the {@link disableVideo} method.
   *
   * **Note**:
   * - This method affects the internal engine and can be called after calling the {@link leaveChannel} method. You can call this method either before or after joining a channel.
   * - This method resets the internal engine and takes some time to take effect. We recommend using the following API methods to control the video engine modules separately:
   *   - {@link enableLocalVideo}: Whether to enable the camera to create the local video stream.
   *   - {@link muteLocalVideoStream}: Whether to publish the local video stream.
   *   - {@link muteLocalVideoStream}: Whether to publish the local video stream.
   *   - {@link muteAllRemoteVideoStreams}: Whether to subscribe to and play all remote video streams.
   *
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  enableVideo(): number {
    return this.rtcEngine.enableVideo();
  }

  /** @zh-cn
   * 关闭视频模块。
   *
   * 该方法用于关闭视频。可以在加入频道前或者通话中调用，在加入频道前调用，则自动开启纯音频模式，在通话中调用则由视频模式切换为纯音频频模式。
   * 调用 {@link enableVideo} 方法可开启视频模式。
   *
   * 成功掉调用该方法后，远端会触发 userEnableVideo(fasle) 回调。
   *
   * **Note**：
   * - 该方法设置的是内部引擎为开启状态，在频道内和频道外均可调用，且在 {@link leaveChannel} 后仍然有效。
   * - 该方法重置整个引擎，响应速度较慢，因此 Agora 建议使用如下方法来控制视频模块：
   *
   *   - {@link enableLocalVideo}：是否启动摄像头采集并创建本地视频流
   *   - {@link muteLocalVideoStream}：是否发布本地视频流
   *   - {@link muteRemoteVideoStream}：是否接收并播放远端视频流
   *   - {@link muteAllRemoteVideoStreams}：是否接收并播放所有远端视频流
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Disables the video module.
   *
   * You can call this method before joining a channel or during a call. If you call this method before joining a channel,
   * the service starts in audio mode. If you call this method during a video call, the video mode switches to the audio mode.
   *
   * To enable the video mode, call the {@link enableVideo} method.
   *
   * **Note**:
   * - This method affects the internal engine and can be called after calling the {@link leaveChannel} method. You can call this method either before or after joining a channel.
   * - This method resets the internal engine and takes some time to take effect. We recommend using the following API methods to control the video engine modules separately:
   *   - {@link enableLocalVideo}: Whether to enable the camera to create the local video stream.
   *   - {@link muteLocalVideoStream}: Whether to publish the local video stream.
   *   - {@link muteLocalVideoStream}: Whether to publish the local video stream.
   *   - {@link muteAllRemoteVideoStreams}: Whether to subscribe to and play all remote video streams.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  disableVideo(): number {
    return this.rtcEngine.disableVideo();
  }

  /** @zh-cn
   * 开启视频预览。
   *
   * 该方法用于在进入频道前启动本地视频预览。调用该 API 前，必须：
   * - 调用 {@link enableVideo} 方法开启视频功能
   * - 调用 {@link setupLocalVideo} 方法设置预览敞口及属性
   *
   * **Note**：
   * - 本地预览默认开启镜像功能
   * - 使用该方法启用了本地视频预览后，如果直接调用 {@link leaveChannel} 退出频道，并不会关闭预览。如需关闭预览，请调用 {@link stopPreview}
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Starts the local video preview before joining a channel.
   *
   * Before starting the preview, always call {@link setupLocalVideo} to set up the preview window and configure the attributes,
   * and also call the {@link enableVideo} method to enable video.
   *
   * If startPreview is called to start the local video preview before calling {@link joinChannel} to join a channel, the local preview
   * remains after after you call {@link leaveChannel} to leave the channel. Call {@link stopPreview} to disable the local preview.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  startPreview(): number {
    return this.rtcEngine.startPreview();
  }

  /** @zh-cn
   * 停止视频预览。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops the local video preview and closes the video.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  stopPreview(): number {
    return this.rtcEngine.stopPreview();
  }

  /** @zh-cn
   * @deprecated 该方法已废弃。请改用 {@link setVideoEncoderConfiguration}。
   * 设置视频属性。
   *
   * @param {VIDEO_PROFILE_TYPE} profile 视频属性，详见 {@link VIDEO_PROFILE_TYPE}
   * @param {boolean} swapWidthAndHeight 是否交换宽高值：
   * - true：交换
   * - false：不交换（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated. Use {@link setVideoEncoderConfiguration} instead.
   * @description Sets the video profile.
   * @param {VIDEO_PROFILE_TYPE} profile The video profile. See {@link VIDEO_PROFILE_TYPE}.
   * @param {boolean} [swapWidthAndHeight = false] Whether to swap width and height:
   * - true: Swap the width and height.
   * - false: Do not swap the width and height.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setVideoProfile(profile: VIDEO_PROFILE_TYPE, swapWidthAndHeight: boolean = false): number {
    return this.rtcEngine.setVideoProfile(profile, swapWidthAndHeight);
  }

  /** @zh-cn
   * 设置摄像头的采集偏好。
   *
   * 一般的视频通话或直播中，默认由 SDK 自动控制摄像头的输出参数。在如下特殊场景中，默认的参数通常无法满足需求，或可能引起设备性能问题，我们推荐调用该接口设置摄像头的采集偏好：
   * - 使用裸数据自采集接口时，如果 SDK 输出的分辨率和帧率高于 {@link setVideoEncoderConfiguration} 中指定的参数，在后续处理视频帧的时候，比如美颜功能时，
   会需要更高的 CPU 及内存，容易导致性能问题。在这种情况下，我们推荐将摄像头采集偏好设置为 CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE(1)，避免性能问题。
   * - 如果没有本地预览功能或者对预览质量没有要求，我们推荐将采集偏好设置为 CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE(1)，以优化 CPU 和内存的资源分配
   * - 如果用户希望本地预览视频比实际编码发送的视频清晰，可以将采集偏好设置为 CAPTURER_OUTPUT_PREFERENCE_PREVIEW(2)
   *
   * **Note**：请在启动摄像头之前调用该方法，如 {@link joinChannel}、{@link enableVideo} 或者 {@link enableLocalVideo}。
   * @param {CameraCapturerConfiguration} config
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the camera capturer configuration.
   *
   * For a video call or live broadcast, generally the SDK controls the camera output parameters.
   * When the default camera capture settings do not meet special requirements or cause performance problems, we recommend using this method to set the camera capture preference:
   * - If the resolution or frame rate of the captured raw video data are higher than those set by {@link setVideoEncoderConfiguration},
   * processing video frames requires extra CPU and RAM usage and degrades performance. We recommend setting config as CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE = 1 to avoid such problems.
   * - If you do not need local video preview or are willing to sacrifice preview quality,
   * we recommend setting config as CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE = 1 to optimize CPU and RAM usage.
   * - If you want better quality for the local video preview, we recommend setting config as CAPTURER_OUTPUT_PREFERENCE_PREVIEW = 2.
   * **Note**: Call this method before enabling the local camera. That said, you can call this method before calling {@link joinChannel}, {@link enableVideo}, or {@link enableLocalVideo},
   * depending on which method you use to turn on your local camera.
   * @param {CameraCapturerConfiguration} config The camera capturer configuration. See {@link CameraCapturerConfiguration}.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setCameraCapturerConfiguration(config: CameraCapturerConfiguration) {
    return this.rtcEngine.setCameraCapturerConfiguration(config);
  }

  /** @zh-cn
   * 设置视频编码属性。
   *
   * 该方法设置视频编码属性。每个属性对应一套视频参数，如分辨率、帧率、码率、视频方向等。 所有设置的参数均为理想情况下的最大值。当视频引擎因网络环境等原因无法达到设置的分辨率、帧率或码率的最大值时，会取最接近最大值的那个值。
   *
   * 如果用户加入频道后不需要重新设置视频编码属性，则 Agora 建议在 {@link enableVideo} 前调用该方法，可以加快首帧出图的时间。
   *
   * @param {VideoEncoderConfiguration} config
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the video encoder configuration.
   *
   * @description Each video encoder configuration corresponds to a set of video parameters, including the resolution, frame rate, bitrate, and video orientation.
   * The parameters specified in this method are the maximum values under ideal network conditions. If the video engine cannot render the video using
   * the specified parameters due to poor network conditions, the parameters further down the list are considered until a successful configuration is found.
   *
   * @description If you do not set the video encoder configuration after joining the channel, you can call this method before calling the {@link enableVideo}
   * method to reduce the render time of the first video frame.
   * @param {VideoEncoderConfiguration} config - The local video encoder configuration. See {@link VideoEncoderConfiguration}.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setVideoEncoderConfiguration(config: VideoEncoderConfiguration): number {
    const {
      width = 640,
      height = 480,
      frameRate = 15,
      minFrameRate = -1,
      bitrate = 0,
      minBitrate = -1,
      orientationMode = 0,
      degradationPreference = 0
    } = config;
    return this.rtcEngine.setVideoEncoderConfiguration({
      width,
      height,
      frameRate,
      minFrameRate,
      bitrate,
      minBitrate,
      orientationMode,
      degradationPreference
    });
  }

  /** @zh-cn
   * 开启或关闭本地美颜功能，并设置美颜效果选项。
   *
   * @param {boolean} enable 是否开启美颜功能：
   * - true：开启
   * - false：（默认）关闭
   *
   * @param {Object} options 设置美颜选项，包含如下字段：
   * @param {number} options.lighteningContrastLevel 亮度明暗对比度：0 为低对比度，1 为正常（默认），2 为高对比度
   * @param {number} options.lighteningLevel 亮度，取值范围为 [0.0, 1.0]，其中 0.0 表示原始亮度。可用来实现美白等视觉效果。
   * @param {number} options.smoothnessLevel 平滑度，取值范围为 [0.0, 1.0]，其中 0.0 表示原始平滑等级。可用来实现祛痘、磨皮等视觉效果。
   * @param {number} options.rednessLevel 红色度，取值范围为 [0.0, 1.0]，其中 0.0 表示原始红色度。可用来实现红润肤色等视觉效果。
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Enables/Disables image enhancement and sets the options
   * @param {boolean} enable Sets whether or not to enable image enhancement:
   * - true: Enables image enhancement.
   * - false: Disables image enhancement.
   * @param {Object} options The image enhancement options. It contains the following parameters:
   * @param {number} options.lighteningContrastLevel The lightening contrast level: 0 for low, 1 (default) for normal, and 2 for high.
   * @param {number} options.lighteningLevel The brightness level. The value ranges from 0.0 (original) to 1.0.
   * @param {number} options.smoothnessLevel The sharpness level. The value ranges between 0 (original) and 1. This parameter is usually used to remove blemishes.
   * @param {number} options.rednessLevel The redness level. The value ranges between 0 (original) and 1. This parameter adjusts the red saturation level.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setBeautyEffectOptions(enable: boolean, options: {
    lighteningContrastLevel: 0 | 1 | 2,
    lighteningLevel: number,
    smoothnessLevel: number,
    rednessLevel: number
  }): number {
    return this.rtcEngine.setBeautyEffectOptions(enable, options);
  }

  /** @zh-cn
   * 设置用户媒体流的优先级。
   *
   * 如果将某个用户的优先级设为高，那么发给这个用户的音视频流的优先级就会高于其他用户。
   * 该方法可以与 {@link setRemoteSubscribeFallbackOption} 搭配使用。如果开启了订阅流回退选项，弱网下 SDK 会优先保证高优先级用户收到的流的质量。
   *
   * **Note**：
   * - 该方法仅适用于直播模式。
   * - 目前 Agora SDK 仅允许将一名远端用户设为高优先级。
   *
   * @param {number} uid 远端用户的 ID
   * @param {Priority} priority
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the priority of a remote user's media stream.
   *
   * Use this method with the {@link setRemoteSubscribeFallbackOption} method. If the fallback function is enabled for a subscribed stream, the SDK ensures
   * the high-priority user gets the best possible stream quality.
   *
   * **Note**: The Agora SDK supports setting userPriority as high for one user only.
   * @param {number} uid The ID of the remote user.
   * @param {Priority} priority The priority of the remote user. See {@link Priority}.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setRemoteUserPriority(uid: number, priority: Priority) {
    return this.rtcEngine.setRemoteUserPriority(uid, priority);
  }

  /** @zh-cn
   * 启用音频模块（默认为开启状态）。
   *
   * **Note**：
   * - 该方法设置的是内部引擎为开启状态，在频道内和频道外均可调用，且在 {@link leaveChannel} 后仍然有效。
   * - 该方法重置整个引擎，响应速度较慢，因此 Agora 建议使用如下方法来控制音频模块：
   *
   *   - {@link enableLocalAudio}：是否启动麦克风采集并创建本地音频流
   *   - {@link muteLocalAudioStream}：是否发布本地音频流
   *   - {@link muteRemoteAudioStream}：是否接收并播放远端音频流
   *   - {@link muteAllRemoteAudioStreams}：是否接收并播放所有远端音频流
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Enables the audio module.
   *
   * The audio module is enabled by default.
   *
   * **Note**:
   * - This method affects the internal engine and can be called after calling the {@link leaveChannel} method. You can call this method either before or after joining a channel.
   * - This method resets the internal engine and takes some time to take effect. We recommend using the following API methods to control the audio engine modules separately:
   *   - {@link enableLocalAudio}: Whether to enable the microphone to create the local audio stream.
   *   - {@link muteLocalAudioStream}: Whether to publish the local audio stream.
   *   - {@link muteRemoteAudioStream}: Whether to subscribe to and play the remote audio stream.
   *   - {@link muteAllRemoteAudioStreams}: Whether to subscribe to and play all remote audio streams.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  enableAudio(): number {
    return this.rtcEngine.enableAudio();
  }

  /** @zh-cn
   * 关闭音频模块。
   *
   * **Note**：
   * - 该方法设置的是内部引擎为开启状态，在频道内和频道外均可调用，且在 {@link leaveChannel} 后仍然有效。
   * - 该方法重置整个引擎，响应速度较慢，因此 Agora 建议使用如下方法来控制音频模块：
   *
   *   - {@link enableLocalAudio}：是否启动麦克风采集并创建本地音频流
   *   - {@link muteLocalAudioStream}：是否发布本地音频流
   *   - {@link muteRemoteAudioStream}：是否接收并播放远端音频流
   *   - {@link muteAllRemoteAudioStreams}：是否接收并播放所有远端音频流
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Disables the audio module.
   *
   * **Note**:
   * - This method affects the internal engine and can be called after calling the {@link leaveChannel} method. You can call this method either before or after joining a channel.
   * - This method resets the internal engine and takes some time to take effect. We recommend using the following API methods to control the audio engine modules separately:
   *   - {@link enableLocalAudio}: Whether to enable the microphone to create the local audio stream.
   *   - {@link muteLocalAudioStream}: Whether to publish the local audio stream.
   *   - {@link muteRemoteAudioStream}: Whether to subscribe to and play the remote audio stream.
   *   - {@link muteAllRemoteAudioStreams}: Whether to subscribe to and play all remote audio streams.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  disableAudio(): number {
    return this.rtcEngine.disableAudio();
  }

  /** @zh-cn
   * 设置音频编码配置。
   *
   * **Note**：该方法需要在 {@link joinChannel} 之前调用，否则不生效。
   *
   * @param {number} profile 设置采样率、码率、编码模式和声道数：
   * - 0：默认设置。通信模式下，为 1：Speech standard；直播模式下，为 2：Music standard
   * - 1：Speech standard，指定 32 KHz 采样率，语音编码, 单声道，编码码率最大值为 18 Kbps
   * - 2：Music standard，指定 48 KHz 采样率，音乐编码, 单声道，编码码率最大值为 48 Kbps
   * - 3：Music standard stereo，指定 48 KHz采样率，音乐编码, 双声道，编码码率最大值为 56 Kbps
   * - 4：Music high quality，指定 48 KHz 采样率，音乐编码, 单声道，编码码率最大值为 128 Kbps
   * - 5：Music high quality stereo，指定 48 KHz 采样率，音乐编码, 双声道，编码码率最大值为 192 Kbps
   *
   * @param {number} scenario 设置音频应用场景：
   * - 0：默认的音频应用场景
   * - 1：Chatroom entertainment，娱乐应用，需要频繁上下麦的场景
   * - 2：Education，教育应用，流畅度和稳定性优先
   * - 3：Game streaming，游戏直播应用，需要外放游戏音效也直播出去的场景
   * - 4：Showroom，秀场应用，音质优先和更好的专业外设支持
   * - 5：Chatroom gaming，游戏开黑
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets audio parameters and application scenarios.
   * @param {number} profile Sets the sample rate, bitrate, encoding mode, and the number of channels:
   * - 0: Default. In the Communication profile, the default value is 1: Speech standard; in the Live Broadcast profile, the default value is 2: Music standard.
   * - 1: speech standard. A sample rate of 32 kHz, audio encoding, mono, and a bitrate of up to 18 Kbps.
   * - 2: Music standard. A sample rate of 48 kHz, music encoding, mono, and a bitrate of up to 48 Kbps.
   * - 3: Music standard stereo. A sample rate of 48 kHz, music encoding, stereo, and a bitrate of up to 56 Kbps.
   * - 4: Music high quality. A sample rate of 48 kHz, music encoding, mono, and a bitrate of up to 128 Kbps.
   * - 5: Music high quality stereo.  A sample rate of 48 kHz, music encoding, stereo, and a bitrate of up to 192 Kbps.
   * @param {number} scenario Sets the audio application scenarios:
   * - 0: Default.
   * - 1: Chatroom entertainment. The entertainment scenario, supporting voice during gameplay.
   * - 2: Education. The education scenario, prioritizing fluency and stability.
   * - 3: Game streaming. The live gaming scenario, enabling the gaming audio effects in the speaker mode in a live broadcast scenario. Choose this scenario for high-fidelity music playback.
   * - 4: Showroom. The showroom scenario, optimizing the audio quality with external professional equipment.
   * - 5: Chatroom gaming. The game chatting scenario.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioProfile(profile: 0|1|2|3|4|5, scenario: 0|1|2|3|4|5): number {
    return this.rtcEngine.setAudioProfile(profile, scenario);
  }

  /** @zh-cn
   * @deprecated 该方法已废弃。请改用 {@link setCameraCapturerConfiguration} 和 {@link setVideoEncoderConfiguration}。
   *
   * 设置视频偏好选项。
   *
   * **Note**：该方法仅适用于直播模式。
   * @param {boolean} preferFrameRateOverImageQuality 视频偏好选项：
   * - true：视频画质和流畅度里，优先保证流畅度
   * - false：视频画质和流畅度里，优先保证画质（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated. Use {@link setCameraCapturerConfiguration} and {@link setVideoEncoderConfiguration} instead.
   * @description Sets the preference option for the video quality (Live Broadcast only).
   * @param {boolean} preferFrameRateOverImageQuality Sets the video quality preference:
   * - true: Frame rate over image quality.
   * - false: (Default) Image quality over frame rate.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setVideoQualityParameters(preferFrameRateOverImageQuality: boolean): number {
    return this.rtcEngine.setVideoQualityParameters(preferFrameRateOverImageQuality);
  }

  /** @zh-cn
   * 启用内置加密，并设置数据加密密码。
   *
   * 如需启用加密，请在 {@link joinChannel} 前调用该方法，并设置加密的密码。
   * 同一频道内的所有用户应设置相同的密码。当用户离开频道时，该频道的密码会自动清除。如果未指定密码或将密码设置为空，则无法激活加密功能。
   *
   * **Note**：为保证最佳传输效果，请确保加密后的数据大小不超过原始数据大小 + 16 字节。16 字节是 AES 通用加密模式下最大填充块大小。
   *
   * @param {string} secret 加密密码
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Enables built-in encryption with an encryption password before joining a channel.
   *
   * All users in a channel must set the same encryption password.
   * The encryption password is automatically cleared once a user has left the channel.
   * If the encryption password is not specified or set to empty, the encryption function will be disabled.
   *
   * **Note**:
   * - For optimal transmission, ensure that the encrypted data size does not exceed the original data size + 16 bytes. 16 bytes is the maximum padding size for AES encryption.
   * - Do not use this method for CDN live streaming.
   * @param {string} secret Encryption Password
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setEncryptionSecret(secret: string): number {
    return this.rtcEngine.setEncryptionSecret(secret);
  }
  /** @zh-cn
   * 设置内置的加密方案。
   *
   * Agora Native SDK 支持内置加密功能，默认使用 AES-128-XTS 加密方式。如需使用其他加密方式，可以调用该 API 设置。
   * 同一频道内的所有用户必须设置相同的加密方式和密码才能进行通话。关于这几种加密方式的区别，请参考 AES 加密算法的相关资料。
   *
   * **Note**：调用本方法前，请先调用 {@link setEncryptionSecret} 方法启用内置加密功能。
   * @param mode 加密方式。目前支持以下几种：
   * - “aes-128-xts”：128 位 AES 加密，XTS 模式
   * - “aes-128-ecb”：128 位 AES 加密，ECB 模式
   * - “aes-256-xts”：256 位 AES 加密，XTS 模式
   * - “”：设置为空字符串时，默认使用加密方式 “aes-128-xts”
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the built-in encryption mode.
   *
   * The Agora SDK supports built-in encryption, which is set to aes-128-xts mode by default.
   Call this method to set the encryption mode to use other encryption modes.
   All users in the same channel must use the same encryption mode and password.
   *
   * Refer to the information related to the AES encryption algorithm on the differences between the encryption modes.
   *
   * **Note**: Call the {@link setEncryptionSecret} method before calling this method.
   * @param mode Sets the encryption mode:
   * - "aes-128-xts": 128-bit AES encryption, XTS mode.
   * - "aes-128-ecb": 128-bit AES encryption, ECB mode.
   * - "aes-256-xts": 256-bit AES encryption, XTS mode.
   * - "": When encryptionMode is set as null, the encryption is in “aes-128-xts” by default.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setEncryptionMode(mode: string): number {
    return this.rtcEngine.setEncryptionMode(mode);
  }

  /** @zh-cn
   * 停止/恢复发送本地音频流。
   *
   * 该方法用于允许/禁止往网络发送本地音频流。
   * 成功调用该方法后，远端会触发 userMuteAudio 回调。
   * @param {boolean} mute
   * - true：停止发送本地音频流
   * - false：继续发送本地音频流（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops/Resumes sending the local audio stream.
   *
   * A successful muteLocalAudioStream method call triggers the userMuteAudio callback on the remote client.
   *
   * **Note**: muteLocalAudioStream(true) does not disable the microphone and thus does not affect any ongoing recording.
   * @param {boolean} mute Sets whether to send/stop sending the local audio stream:
   * - true: Stop sending the local audio stream.
   * - false: (Default) Send the local audio stream.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  muteLocalAudioStream(mute: boolean): number {
    return this.rtcEngine.muteLocalAudioStream(mute);
  }

  /** @zh-cn
   * 停止/恢复接收所有音频流。
   *
   * @param {boolean} mute
   * - true：停止接收所有音频流
   * - false：继续接收所有音频流（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops/Resumes receiving all remote audio streams.
   * @param {boolean} mute Sets whether to receive/stop receiving all remote audio streams:
   * - true: Stop receiving all remote audio streams.
   * - false: (Default) Receive all remote audio streams.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  muteAllRemoteAudioStreams(mute: boolean): number {
    return this.rtcEngine.muteAllRemoteAudioStreams(mute);
  }

  /** @zh-cn
   * 设置是否默认接收音频流。
   *
   * 该方法在加入频道前后都可调用。如果在加入频道后调用 setDefaultMuteAllRemoteAudioStreams(true)，会接收不到后面加入频道的用户的音频流。
   *
   * @param {boolean} mute
   * - true：默认不接收所有音频流
   * - false：默认接收所有音频流（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets whether to receive all remote audio streams by default.
   *
   * You can call this method either before or after joining a channel. If you call this method after joining a channel,
   the remote audio streams of all subsequent users are not received.
   * @param {boolean} mute Sets whether or not to receive/stop receiving all remote audio streams by default:
   * - true: Stop receiving all remote audio streams by default.
   * - false: (Default) Receive all remote audio streams by default.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setDefaultMuteAllRemoteAudioStreams(mute: boolean): number {
    return this.rtcEngine.setDefaultMuteAllRemoteAudioStreams(mute);
  }

  /** @zh-cn
   * 停止/恢复接收指定音频流。
   *
   * @param {number} uid 指定的用户 ID
   * @param {boolean} mute
   * - true：停止接收指定用户的音频流
   * - false：继续接收指定用户的音频流
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops/Resumes receiving a specified audio stream.
   * @param {number} uid ID of the specified remote user.
   * @param {boolean} mute Sets whether to receive/stop receiving the specified remote user's audio stream:
   * - true: Stop receiving the specified remote user’s audio stream.
   * - false: (Default) Receive the specified remote user’s audio stream.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  muteRemoteAudioStream(uid: number, mute: boolean): number {
    return this.rtcEngine.muteRemoteAudioStream(uid, mute);
  }

  /** @zh-cn
   * 停止/恢复发送本地视频流。
   *
   * 成功调用该方法后，远端会触发 userMuteVideo 回调。
   *
   * **Note**：调用该方法时，SDK 不再发送本地视频流，但摄像头仍然处于工作状态。
   * @param {boolean} mute
   * - true：停止发送本地视频流
   * - false：发动本地视频流（默认）
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops/Resumes sending the local video stream.
   *
   * A successful muteLocalVideoStream method call triggers the userMuteVideo callback on the remote client.
   *
   * **Note**: muteLocalVideoStream(true) does not disable the camera and thus does not affect the retrieval of the local video streams.
   * @param {boolean} mute Sets whether to send/stop sending the local video stream:
   * - true: Stop sending the local video stream.
   * - false: (Default) Send the local video stream.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  muteLocalVideoStream(mute: boolean): number {
    return this.rtcEngine.muteLocalVideoStream(mute);
  }

  /** @zh-cn
   * 开/关本地视频采集。
   *
   * 该方法禁用/启用本地视频功能。enableLocalVideo(false) 适用于只看不发的视频场景。
   * 成功调用该方法后，远端会触发 userEnableLocalVideo 回调。
   *
   * **Note**：
   * - 请在 {@link enableVideo} 后调用该方法，否则该方法可能无法正常使用。
   * - 该方法设置的是内部引擎为启用或禁用状态，在 {@link leaveChannel} 后仍然有效。
   *
   * @param {boolean} enable
   * - true：开启本地视频采集和渲染（默认）
   * - false：关闭本地视频采集和渲染。关闭后，远端用户会接收不到本地用户的视频流；但本地用户依然可以接收远端用户的视频流
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Disables/Re-enables the local video capture.
   *
   * The local video is enabled by default. This method enables/disables the local video, which is only applicable to
   * the scenario when the user only wants to watch the remote video without sending
   * any video stream to the other user.
   *
   * A successful enableLocalVideo method call triggers the userEnableLocalVideo callback on the remote client.
   *
   * **Note**: This method affects the internal engine and can be called after calling the {@link leaveChannel} method.
   *
   * @param {boolean} enable Sets whether to disable/re-enable the local video, including the capturer, renderer, and sender:
   * - true: (Default) Re-enable the local video.
   * - false: Disable the local video. Once the local video is disabled, the remote users can no longer receive the video stream of this user,
   while this user can still receive the video streams of other remote users. When you set enabled as false, this method does not require a local camera.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  enableLocalVideo(enable: boolean): number {
    return this.rtcEngine.enableLocalVideo(enable);
  }

  /** @zh-cn
   * 开/关本地音频采集。
   *
   * 当 App 加入频道时，它的语音功能默认是开启的。该方法可以关闭或重新开启本地语音功能，即停止或重新开始本地音频采集。
   *
   * 该方法不影响接收或播放远端音频流，{@link enableLocalAudio}(false) 适用于只听不发的用户场景。语音功能关闭或重新开启后，会收到回调 microphoneEnabled。
   * @param {boolean} enable
   * - true：开启本地音频采集（默认）
   * - false：关闭本地音频采集
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Enables/Disables the local audio capture.
   *
   * The audio function is enabled by default. This method disables/re-enables the local audio function, that is, to stop or restart local audio capture and processing.
   *
   * This method does not affect receiving or playing the remote audio streams, and enableLocalAudio(false) is applicable to scenarios where the user wants to receive remote
   audio streams without sending any audio stream to other users in the channel.
   *
   * The SDK triggers the microphoneEnabled callback once the local audio function is disabled or re-enabled.
   * @param {boolean} enable Sets whether to disable/re-enable the local audio function:
   * - true: (Default) Re-enable the local audio function, that is, to start local audio capture and processing.
   * - false: Disable the local audio function, that is, to stop local audio capture and processing.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  enableLocalAudio(enable: boolean): number {
    return this.rtcEngine.enableLocalAudio(enable);
  }

  /** @zh-cn
   * 停止/恢复接收所有视频流。
   *
   * @param {boolean} mute
   * - true：停止接收所有视频流
   * - false：继续接收所有视频流（默认）
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops/Resumes receiving all remote video streams.
   *
   * @param {boolean} mute Sets whether to receive/stop receiving all remote video streams:
   * - true: Stop receiving all remote video streams.
   * - false: (Default) Receive all remote video streams.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  muteAllRemoteVideoStreams(mute: boolean): number {
    return this.rtcEngine.muteAllRemoteVideoStreams(mute);
  }

  /** @zh-cn
   * 设置是否默认接收视频流。
   *
   * @param {boolean} mute
   * - true：默认不接收任何视频流
   * - false：默认继续接收所有视频流（默认）
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets whether to receive all remote video streams by default.
   * @param {boolean} mute Sets whether to receive/stop receiving all remote video streams by default:
   * - true: Stop receiving all remote video streams by default.
   * - false: (Default) Receive all remote video streams by default.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setDefaultMuteAllRemoteVideoStreams(mute: boolean): number {
    return this.rtcEngine.setDefaultMuteAllRemoteVideoStreams(mute);
  }

  /** @zh-cn
   * 启用说话者音量提示。
   *
   * 该方法允许 SDK 定期向 App 反馈当前谁在说话以及说话者的音量。启用该方法后，无论频道内是否有人说话，都会在说话声音音量提示回调
   groupAudioVolumeIndication 回调中按设置的间隔时间返回音量提示。
   *
   * @param {number} interval 指定音量提示的时间间隔：
   * - <= 10：禁用音量提示功能
   * - > 10：返回音量提示的间隔，单位为毫秒。建议设置到大于 200 毫秒
   * @param {number} smooth 平滑系数，指定音量提示的灵敏度。取值范围为 [0, 10]，建议值为 3，数字越大，波动越灵敏；数字越小，波动越平滑
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Enables the groupAudioVolumeIndication callback at a set time interval to report on which users are speaking and the speakers' volume.
   *
   * Once this method is enabled, the SDK returns the volume indication in the groupAudioVolumeIndication callback at the set time interval,
   regardless of whether any user is speaking in the channel.
   * @param {number} interval Sets the time interval between two consecutive volume indications:
   * - ≤ 0: Disables the volume indication.
   * - > 0: Time interval (ms) between two consecutive volume indications. We recommend setting interval ≥ 200 ms.
   * @param {number} smooth The smoothing factor sets the sensitivity of the audio volume indicator. The value ranges between 0 and 10.
   The greater the value, the more sensitive the indicator. The recommended value is 3.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  enableAudioVolumeIndication(interval: number, smooth: number): number {
    return this.rtcEngine.enableAudioVolumeIndication(interval, smooth);
  }

  /** @zh-cn
   * 停止/恢复接收指定视频流。
   *
   * @param {number} uid 指定用户的 ID
   * @param {boolean} mute
   * - true：停止接收指定用户的视频流
   * - false：继续接收指定用户的视频流（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops/Resumes receiving a specified remote user's video stream.
   * @param {number} uid User ID of the specified remote user.
   * @param {boolean} mute Sets whether to receive/stop receiving a specified remote user's video stream:
   * - true: Stop receiving a specified remote user’s video stream.
   * - false: (Default) Receive a specified remote user’s video stream.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  muteRemoteVideoStream(uid: number, mute: boolean): number {
    return this.rtcEngine.muteRemoteVideoStream(uid, mute);
  }

  /** @zh-cn
   * 设置耳返音量。
   *
   * @param {number} volume 耳返的音量，取值范围为 [0, 100]，默认值为 100
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the volume of the in-ear monitor.
   * @param {number} volume Sets the volume of the in-ear monitor. The value ranges between 0 and 100 (default).
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setInEarMonitoringVolume(volume: number): number {
    return this.rtcEngine.setInEarMonitoringVolume(volume);
  }

  /** @zh-cn
   * @deprecated 该方法已废弃。请改用 {@link disableAudio}。
   * 禁用频道内的音频功能。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated. Use {@link disableAudio} instead.
   * @description Disables the audio function in the channel.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  pauseAudio() {
    deprecate('disableAudio');
    return this.rtcEngine.pauseAudio();
  }

  /** @zh-cn
   * @deprecated 该方法已弃用。请改用 {@link enableAudio}。
   * 启用频道内的音频功能。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated  This method is deprecated. Use {@link enableAudio} instead.
   * @description Resumes the audio function in the channel.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  resumeAudio() {
    deprecate('enableAudio');
    return this.rtcEngine.resumeAudio();
  }

  /** @zh-cn
   * 设置日志文件。
   * 设置 SDK 的输出 log 文件。SDK 运行时产生的所有 log 将写入该文件。App 必须保证指定的目录存在而且可写。
   *
   * **Note**：如需调用本方法，请在调用 {@link initialize} 方法初始化 AgoraRtcEngine 对象后立即调用，否则可能造成输出日志不完整。
   * @param {string} filepath 日志文件的完整路径
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Specifies an SDK output log file.
   *
   * The log file records all log data for the SDK’s operation. Ensure that the directory for the log file exists and is writable.
   *
   * @param {string} filepath File path of the log file. The string of the log file is in UTF-8.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setLogFile(filepath: string): number {
    return this.rtcEngine.setLogFile(filepath);
  }

  /** @zh-cn
   * 设置 SDK 输出的日志文件大小，单位为 KB。
   *
   * Agora SDK 设有 2 个日志文件，每个文件默认大小为 512 KB。如果你将 `size` 设置为 1024 KB，SDK 会最多输出 2 M 的日志文件。如果日志文件超出设置值，新的日志会覆盖之前的日志。
   * @param {number} size 指定 SDK 输出日志文件的内存大小，单位为 KB
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the log file size (KB).
   *
   * The Agora SDK has two log files, each with a default size of 512 KB.
   If you set size as 1024 KB, the SDK outputs log files with a total maximum size of 2 MB.
   If the total size of the log files exceed the set value, the new output log files overwrite the old output log files.
   * @param {number} size The SDK log file size (KB).
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setLogFileSize(size: number): number {
    return this.rtcEngine.setLogFileSize(size);
  }

  /** @zh-cn
   * 设置屏幕共享对象的日志。
   * 请在屏幕共享对象初始化后调用。
   * @param {string} filepath 日志文件的完整路径
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Specifies an SDK output log file for the video source object.
   *
   * **Note**: Call this method after the {@link videoSourceInitialize} method.
   * @param {string} filepath filepath of log. The string of the log file is in UTF-8.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceSetLogFile(filepath: string) {
    return this.rtcEngine.videoSourceSetLogFile(filepath);
  }

  /** @zh-cn
   * 设置日志文件过滤器。
   *
   * 该方法设置 SDK 的输出日志过滤等级。不同的过滤等级可以单独或组合使用。
   * 日志级别顺序依次为 OFF、CRITICAL、ERROR、WARNING、INFO 和 DEBUG。选择一个级别，你就可以看到在该级别之前所有级别的日志信息。
   * 例如，你选择 WARNING 级别，就可以看到在 CRITICAL、ERROR 和 WARNING 级别上的所有日志信息。
   * @param {number} filter 设置过滤器等级：
   * - LOG_FILTER_OFF = 0：不输出任何日志
   * - LOG_FILTER_DEBUG = 0x80f：输出所有的 API 日志。如果你想获取最完整的日志，可将日志级别设为该等级
   * - LOG_FILTER_INFO = 0x0f：输出 CRITICAL、ERROR、WARNING、INFO 级别的日志。我们推荐你将日志级别设为该等级
   * - LOG_FILTER_WARNING = 0x0e：仅输出 CRITICAL、ERROR、WARNING 级别的日志
   * - LOG_FILTER_ERROR = 0x0c：仅输出 CRITICAL、ERROR 级别的日志
   * - LOG_FILTER_CRITICAL = 0x08：仅输出 CRITICAL 级别的日志
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the output log level of the SDK.
   *
   * You can use one or a combination of the filters. The log level follows the sequence of OFF, CRITICAL, ERROR, WARNING, INFO, and DEBUG.
   Choose a level to see the logs preceding that level. For example, if you set the log level to WARNING, you see the logs within levels CRITICAL,
   ERROR, and WARNING.
   * @param {number} filter Sets the filter level:
   * - LOG_FILTER_OFF = 0: Do not output any log.
   * - LOG_FILTER_DEBUG = 0x80f: Output all the API logs. Set your log filter as DEBUG if you want to get the most complete log file.
   * - LOG_FILTER_INFO = 0x0f: Output logs of the CRITICAL, ERROR, WARNING and INFO level. We recommend setting your log filter as this level.
   * - LOG_FILTER_WARNING = 0x0e: Output logs of the CRITICAL, ERROR and WARNING level.
   * - LOG_FILTER_ERROR = 0x0c: Output logs of the CRITICAL and ERROR level.
   * - LOG_FILTER_CRITICAL = 0x08: Output logs of the CRITICAL level.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setLogFilter(filter: number): number {
    return this.rtcEngine.setLogFilter(filter);
  }

  /** @zh-cn
   * 开/关视频双流模式。
   * 该方法设置单流（默认）或者双流模式。发送端开启双流模式后，接收端可以选择接收大流还是小流。其中，大流指高分辨率、高码率的视频流，小流指低分辨率、低码率的视频流。
   * @param {boolean} enable 指定双流或者单流模式：
   * - true：开启双流
   * - false：不开启双流（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Enables/Disables the dual video stream mode.
   *
   * If dual-stream mode is enabled, the receiver can choose to receive the high stream (high-resolution high-bitrate video stream)
   or low stream (low-resolution low-bitrate video stream) video.
   * @param {boolean} enable Sets the stream mode:
   * - true: Dual-stream mode.
   * - false: (Default) Single-stream mode.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  enableDualStreamMode(enable: boolean): number {
    return this.rtcEngine.enableDualStreamMode(enable);
  }

  /** @zh-cn
   * 设置订阅的视频流类型。
   *
   * 如果发送端选择发送视频双流（大流或小流），接收端可以选择接收大流还是小流。其中大流可以理解为高分辨率高码率的视频流，小流则是低分辨率低码率的视频流。
   * 该方法可以根据视频窗口的大小动态调整对应视频流的大小，以节约带宽和计算资源。
   * - 如果发送端用户已调用 {@link enableDualStreamMode} 启用了双流模式，SDK 默认接收大流。如需使用小流，可调用本方法进行切换。
   * - 如果发送端用户未启用双流模式，SDK 默认接收大流。
   *
   * 视频小流默认的宽高比和视频大流的宽高比一致。根据当前大流的宽高比，系统会自动分配小流的分辨率、帧率及码率。
   *
   * 调用本方法的执行结果将在 onApiCallExecuted 中返回。
   * @param {number} uid 用户 ID
   * @param {StreamType} streamType 视频流类型：
   * - 0：视频大流，即高分辨率、高码率的视频流
   * - 1：视频小流，即低分辨率、低码率的视频流
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the video stream type of the remotely subscribed video stream when the remote user sends dual streams.
   *
   * If the dual-stream mode is enabled by calling enableDualStreamMode, you will receive the
   * high-video stream by default. This method allows the application to adjust the
   * corresponding video-stream type according to the size of the video windows to save the bandwidth
   * and calculation resources.
   *
   * If the dual-stream mode is not enabled, you will receive the high-video stream by default.
   * The result after calling this method will be returned in onApiCallExecuted. The Agora SDK receives
   * the high-video stream by default to save the bandwidth. If needed, users can switch to the low-video
   * stream using this method.
   * @param {number} uid ID of the remote user sending the video stream.
   * @param {StreamType} streamType Sets the video stream type:
   * - 0: High-stream video, the high-resolution, high-bitrate video.
   * - 1: Low-stream video, the low-resolution, low-bitrate video.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setRemoteVideoStreamType(uid: number, streamType: StreamType): number {
    return this.rtcEngine.setRemoteVideoStreamType(uid, streamType);
  }

  /** @zh-cn
   * 设置默认订阅的视频流类型。
   *
   * @param {StreamType} streamType 设置视频流的类型：
   * - 0：视频大流，即高分辨、高码率的视频流
   * - 1：视频小流，即低分辨、低码率的视频流
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the default video-stream type of the remotely subscribed video stream when the remote user sends dual streams.
   * @param {StreamType} streamType Sets the video stream type:
   * - 0: High-stream video, the high-resolution, high-bitrate video.
   * - 1: Low-stream video, the low-resolution, low-bitrate video.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setRemoteDefaultVideoStreamType(streamType: StreamType): number {
    return this.rtcEngine.setRemoteDefaultVideoStreamType(streamType);
  }

  /** @zh-cn
   * 打开与 Web SDK 的互通（仅在直播下适用）。
   *
   * 该方法打开或关闭与 Agora Web SDK 的互通。该方法仅在直播模式下适用，通信模式下默认互通是打开的。
   * @param {boolean} enable 是否打开与 Agora Web SDK 的互通：
   * - true：打开互通
   * - false：关闭互通（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Enables interoperability with the Agora Web SDK (Live Broadcast only).
   *
   * Use this method when the channel profile is Live Broadcast.
   Interoperability with the Agora Web SDK is enabled by default when the channel profile is Communication.
   * @param {boolean} enable Sets whether to enable/disable interoperability with the Agora Web SDK:
   * - true: Enable.
   * - false: (Default) Disable.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  enableWebSdkInteroperability(enable: boolean): number {
    return this.rtcEngine.enableWebSdkInteroperability(enable);
  }

  /** @zh-cn
   * 设置本地视频镜像。
   *
   * 该方法设置本地视频镜像，须在开启本地预览前设置。如果在开启预览后设置，需要重新开启预览才能生效。
   * @param {number} mirrortype 设置本地视频镜像模式：
   * - 0：默认镜像模式，即由 SDK 决定镜像模式
   * - 1：启用镜像模式
   * - 2：关闭镜像模式
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the local video mirror mode.
   *
   * Use this method before startPreview, or it does not take effect until you re-enable startPreview.
   * @param {number} mirrortype Sets the local video mirror mode:
   * - 0: The default mirror mode, that is, the mode set by the SDK
   * - 1: Enable the mirror mode
   * - 2: Disable the mirror mode
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setLocalVideoMirrorMode(mirrortype: 0|1|2): number {
    return this.rtcEngine.setLocalVideoMirrorMode(mirrortype);
  }

  /** @zh-cn
   * 设置本地语音音调。
   *
   * @param {number} pitch 语音频率。可以在 [0.5, 2.0] 范围内设置。取值越小，则音调越低。默认值为 1.0，表示不需要修改音调
   * @returns {number}
   * - 0：方法调用成功
   * - -1：方法调用失败
   */
  /**
   * @description Changes the voice pitch of the local speaker.
   * @param {number} pitch - The value ranges between 0.5 and 2.0.
   * The lower the value, the lower the voice pitch.
   * The default value is 1.0 (no change to the local voice pitch).
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setLocalVoicePitch(pitch: number): number {
    return this.rtcEngine.setLocalVoicePitch(pitch);
  }

  /** @zh-cn
   * 设置本地语音音效均衡。
   * @param {number} bandFrequency 频谱子带索引，取值范围是 [0-9]，分别代表 10 个频带，对应的中心频率是 [31，62，125，250，500，1k，2k，4k，8k，16k] Hz
   * @param {number} bandGain 每个 band 的增益，单位是 dB，每一个值的范围是 [-15，15]，默认值为 0
   * @returns {number}
   * - 0：方法调用成功
   * - -1：方法调用失败
   */
  /**
   * @description Sets the local voice equalization effect.
   * @param {number} bandFrequency - Sets the band frequency.
   * The value ranges between 0 and 9, representing the respective 10-band center frequencies of the voice effects
   * including 31, 62, 125, 500, 1k, 2k, 4k, 8k, and 16k Hz.
   * @param {number} bandGain - Sets the gain of each band in dB. The value ranges between -15 and 15.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setLocalVoiceEqualization(bandFrequency: number, bandGain: number): number {
    return this.rtcEngine.setLocalVoiceEqualization(bandFrequency, bandGain);
  }

  /** @zh-cn
   * 设置本地音效混响。
   *
   * **Note**： Agora SDK 在 v2.4.0 版本中提供一个使用更为简便的接口 setLocalVoiceReverbPreset，该
     方法通过一系列内置参数的调整，直接实现流行、R&B、摇滚、嘻哈等预置的混响效果。详见 {@link setLocalVoiceReverbPreset}。
   * @param {number} reverbKey 混响音效 Key。该方法共有 5 个混响音效 Key：
   * - AUDIO_REVERB_DRY_LEVEL = 0：原始声音强度，即所谓的 dry signal，取值范围 [-20, 10]，单位为 dB
   * - AUDIO_REVERB_WET_LEVEL = 1：早期反射信号强度，即所谓的 wet signal，取值范围 [-20, 10]，单位为 dB
   * - AUDIO_REVERB_ROOM_SIZE = 2：所需混响效果的房间尺寸，一般房间越大，混响越强，取值范围 [0, 100]，单位为 dB
   * - AUDIO_REVERB_WET_DELAY = 3：Wet signal 的初始延迟长度，取值范围 [0, 200]，单位为毫秒
   * - AUDIO_REVERB_STRENGTH = 4：混响持续的强度，取值范围为 [0, 100]
   * @param {number} value 各混响音效 Key 所对应的值
   * @returns {number}
   * - 0：方法调用成功
   * - -1：方法调用失败
   */
  /**
   * @description Sets the local voice reverberation.
   * @param {number} reverbKey Sets the audio reverberation key.
   * - AUDIO_REVERB_DRY_LEVEL = 0: Level of the dry signal (-20 to 10 dB).
   * - AUDIO_REVERB_WET_LEVEL = 1: Level of the early reflection signal (wet signal) (-20 to 10 dB).
   * - AUDIO_REVERB_ROOM_SIZE = 2: Room size of the reflection (0 to 100 dB).
   * - AUDIO_REVERB_WET_DELAY = 3: Length of the initial delay of the wet signal (0 to 200 ms).
   * - AUDIO_REVERB_STRENGTH = 4: Strength of the late reverberation (0 to 100).
   * @param {number} value Sets the value of the reverberation key.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setLocalVoiceReverb(reverbKey: number, value: number): number {
    return this.rtcEngine.setLocalVoiceReverb(reverbKey, value);
  }

  /** @zh-cn
   * 设置本地语音变声。
   *
   * **Note**：该方法不能与 {@link setLocalVoiceReverbPreset} 方法同时使用，否则先调用的方法会不生效。
   * @param {VoiceChangerPreset} preset 设置本地语音的变声效果选项
   */
  /**
   * @description Sets the local voice changer option.
   * @param {VoiceChangerPreset} preset The local voice changer option. See {@link VoiceChangerPreset}.
   */
  setLocalVoiceChanger(preset: VoiceChangerPreset): number {
    return this.rtcEngine.setLocalVoiceChanger(preset);
  }

  /** @zh-cn
   * 设置预设的本地语音混响效果选项。
   *
   * **Note**：
   * - 该方法不能与 {@link setLocalVoiceReverbPreset} 方法同时使用。
   * - 该方法不能与 {@link setLocalVoiceChanger} 方法同时使用，否则先调的方法会不生效。
   * @param {AudioReverbPreset} preset 预设的本地语音混响效果选项
   */
  /**
   * @description Sets the preset local voice reverberation effect.
   *
   * **Note**:
   * - Do not use this method together with {@link setLocalVoiceReverb}.
   * - Do not use this method together with {@link setLocalVoiceChanger}, or the method called eariler does not take effect.
   * @param {AudioReverbPreset} preset The local voice reverberation preset. See {@link AudioReverbPreset}.
   */
  setLocalVoiceReverbPreset(preset: AudioReverbPreset) {
    return this.rtcEngine.setLocalVoiceReverbPreset(preset);
  }

  /** @zh-cn
   * 设置弱网条件下发布的音视频流回退选项。
   *
   * 网络不理想的环境下，直播音视频的质量都会下降。使用该接口并将 option 设置为 STREAM_FALLBACK_OPTION_AUDIO_ONLY后，SDK 会：
   * - 在上行弱网且音视频质量严重受影响时，自动关断视频流，从而保证或提高音频质量。
   * - 持续监控网络质量，并在网络质量改善时恢复音视频流。
   *
   * 当本地推流回退为音频流时，或由音频流恢复为音视频流时，SDK 会触发 localPublishFallbackToAudioOnly 回调。
   *
   * **Note**：旁路推流场景下，设置本地推流回退为 Audio-only 可能会导致远端的 CDN 用户听到声音的时间有所延迟。因此在有旁路推流的场景下，Agora 建议不开启该功能。
   * @param {number} option 本地推流回退处理选项：
   * - STREAM_FALLBACK_OPTION_DISABLED = 0：（默认）上行网络较弱时，不对音视频流作回退处理，但不能保证音视频流的质量
   * - STREAM_FALLBACK_OPTION_AUDIO_ONLY = 2：上行网络较弱时只发布音频流
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the fallback option for the locally published video stream based on the network conditions.
   * The default setting for option is STREAM_FALLBACK_OPTION_AUDIO_ONLY, where there is no fallback for the locally published video stream when the uplink network conditions are poor.
   * If `option` is set toSTREAM_FALLBACK_OPTION_AUDIO_ONLY, the SDK will:
   * - Disable the upstream video but enable audio only when the network conditions worsen and cannot support both video and audio.
   * - Re-enable the video when the network conditions improve.
   * When the locally published stream falls back to audio only or when the audio stream switches back to the video,
   * the localPublishFallbackToAudioOnly callback is triggered.
   * **Note**:
   * Agora does not recommend using this method for CDN live streaming, because the remote CDN live user will have a noticeable lag when the locally publish stream falls back to audio-only.
   * @param {number} option Sets the fallback option for the locally published video stream.
   * - STREAM_FALLBACK_OPTION_DISABLED = 0: (Default) No fallback behavior for the local/remote video stream when the uplink/downlink network conditions are poor. The quality of the stream is not guaranteed.
   * - STREAM_FALLBACK_OPTION_AUDIO_ONLY = 2: Under poor uplink network conditions, the locally published video stream falls back to audio only.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setLocalPublishFallbackOption(option: 0|1|2): number {
    return this.rtcEngine.setLocalPublishFallbackOption(option);
  }

  /** @zh-cn
   * 设置弱网条件下订阅的音视频流回退选项。
   *
   * 网络不理想的环境下，直播音视频的质量都会下降。使用该接口并将 option 设置为 STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW 或者 STREAM_FALLBACK_OPTION_AUDIO_ONLY(2)后，SDK 会：
   * - 在下行弱网且音视频质量严重受影响时，将视频流切换为小流，或关断视频流，从而保证或提高音频质量。
   * - 持续监控网络质量，并在网络质量改善时恢复音视频流。
   *
   * 当远端订阅流回退为音频流时，或由音频流恢复为音视频流时，SDK 会触发 remoteSubscribeFallbackToAudioOnly 回调。
   * @param {number} option 远端订阅流回退处理选项：
   * - STREAM_FALLBACK_OPTION_DISABLED = 0：下行网络较弱时，不对音视频流作回退处理，但不能保证音视频流的质量
   * - STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW = 1：（默认）下行网络较弱时只接收视频小流。该选项只对该方法有效，对 {@link setLocalPublishFallbackOption} 方法无效
   * - STREAM_FALLBACK_OPTION_AUDIO_ONLY = 2：下行网络较弱时，先尝试只接收视频小流；如果网络环境无法显示视频，则再回退到只接收远端订阅的音频流
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the fallback option for the remotely subscribed video stream based on the network conditions.
   *
   * If `option` is set as STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW or STREAM_FALLBACK_OPTION_AUDIO_ONLY(2):
   * - the SDK automatically switches the video from a high-stream to a low-stream, or disables the video when the downlink network condition cannot support both audio and video
   * to guarantee the quality of the audio.
   * - The SDK monitors the network quality and restores the video stream when the network conditions improve.
   *
   * When the remotely subscribed video stream falls back to audio only or when the audio-only stream switches back to the video stream,
   * the SDK triggers the remoteSubscribeFallbackToAudioOnly callback.
   * @param {number} option Sets the fallback option for the remotely subscribed stream.
   * - STREAM_FALLBACK_OPTION_DISABLED = 0: No fallback behavior for the local/remote video stream when the uplink/downlink network conditions are poor. The quality of the stream is not guaranteed.
   * - STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW = 1: (Default) The remotely subscribed video stream falls back to the low-stream video when the downlink network condition worsens. This option works only
   * for this method and not for the {@link setLocalPublishFallbackOption} method.
   * - STREAM_FALLBACK_OPTION_AUDIO_ONLY = 2: Under poor downlink network conditions, the remotely subscribed video stream first falls back to the low-stream video; and then to an audio-only stream if the network condition worsens.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setRemoteSubscribeFallbackOption(option: 0|1|2): number {
    return this.rtcEngine.setRemoteSubscribeFallbackOption(option);
  }

  /** @zh-cn
   * 注册本地用户 User account。
   *
   * 该方法为本地用户注册一个 User Account。注册成功后，该 User Account 即可标识该本地用户的身份，用户可以使用它加入频道。
   * 成功注册 User Account 后，本地会触发 onLocalUserRegistered 回调，告知本地用户的 UID 和 User Account。
   *
   * 该方法为可选。如果你希望用户使用 User Account 加入频道，可以选用以下两种方式：
   * - 先调用 {@link registerLocalUserAccount} 方法注册 Account，再调用 {@link joinChannelWithUserAccount} 方法加入频道。
   * - 直接调用 {@link joinChannelWithUserAccount} 方法加入频道。
   *
   * 两种方式的区别在于，提前调用 {@link registerLocalUserAccount}，可以缩短使用 {@link joinChannelWithUserAccount} 进入频道的时间。
   * 
   * 为保证通信质量，请确保频道内使用同一类型的数据标识用户身份。即同一频道内需要统一使用 UID 或 User Account。如果有用户通过 Agora Web SDK 加入频道，请确保 Web 加入的用户也是同样类型。
   *
   * **Note**：
   * - 请确保 `userAccount` 不能为空，否则该方法不生效。
   * - 请确保在该方法中设置的 `userAccount` 在频道中的唯一性。
   *
   * @param appId 你的项目在 Agora Dashboard 注册的 App ID
   * @param userAccount 用户 User Account。该参数为必填，最大不超过 255 字节，不可填 null。请确保注册的 User Account 的唯一性。以下为支持的字符集范围（共 89 个字符）：
   * - 26 个小写英文字母 a-z
   * - 26 个大写英文字母 A-Z
   * - 10 个数字 0-9
   * - 空格
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ","
   * @returns
   * - 0：方法调用成功
   * - < 0：方法调用失败
  /**
   * @description Registers a user account.

   * Once registered, the user account can be used to identify the local user when the user joins the channel. After the user successfully registers a   user account,  the SDK triggers the onLocalUserRegistered callback on the local client, reporting the user ID and user account of the local user.
   * 
   * To join a channel with a user account, you can choose either of the following:
   * - Call the {@link registerLocalUserAccount} method to create a user account, and then the {@link joinChannelWithUserAccount} method to join the channel.
   * - Call the {@link joinChannelWithUserAccount} method to join the channel.
   *
   * The difference between the two is that for the former, the time elapsed between calling the {@link joinChannelWithUserAccount} method and joining the channel is shorter than the latter.
   * 
   * To ensure smooth communication, use the same parameter type to identify the user. For example, if a user joins the channel with a user ID, then ensure all the other users use the user ID too. The same applies to the user account. If a user joins the channel with the Agora Web SDK, ensure that the `uid` of the user is set to the same parameter type.
   * 
   * **Note**:
   * - Ensure that you set the `userAccount` parameter. Otherwise, this method does not take effect.
   * - Ensure that the value of the `userAccount` parameter is unique in the channel.
   *
   * @param {string} appId The App ID of your project.
   * @param {string} userAccount The user account. The maximum length of this parameter is 255 bytes. Ensure that you set this parameter and do not set it as null. Ensure that you set this parameter and do not set it as null.
   * Supported character scopes are:
   * - The 26 lowercase English letters: a to z.
   * - The 26 uppercase English letters: A to Z.
   * - The 10 numbers: 0 to 9.
   * - The space.
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  registerLocalUserAccount(appId: string, userAccount: string): number {
    return this.rtcEngine.registerLocalUserAccount(appId, userAccount)
  }

  /** @zh-cn
   * 使用 User Account 加入频道。
   *
   * 该方法允许本地用户使用 User Account 加入频道。成功加入频道后，会触发以下回调：
   * - 本地：localUserRegistered 和 userInfoUpdated
   * - 远端：通信模式下的用户和直播模式下的主播加入频道后，远端会依次触发 userJoined 和 userInfoUpdated 回调
   *
   * **Note**：为保证通信质量，请确保频道内使用同一类型的数据标识用户身份。即同一频道内需要统一使用 UID 或 User Account。如果有用户通过 Agora Web SDK 加入频道，请确保 Web 加入的用户也是同样类型。
   *
   * @param token 在 App 服务器端生成的用于鉴权的 Token：
   * - 安全要求不高：你可以使用 Dashboard 生成的临时 Token，详见[获取临时 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取临时-token)
   * - 安全要求高：将值设为你的服务端生成的正式 Token，详见[获取正式 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取正式-token)
   * @param channel 标识频道的频道名，最大不超过 64 字节。以下为支持的字符集范围（共 89 个字符）：
   * - 26 个小写英文字母 a-z
   * - 26 个大写英文字母 A-Z
   * - 10 个数字 0-9
   * - 空格
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ","
   * @param userAccount 用户 User Account。该参数为必须，最大不超过 255 字节，不可为 null。请确保加入频道的 User Account 的唯一性。
   * - 26 个小写英文字母 a-z
   * - 26 个大写英文字母 A-Z
   * - 10 个数字 0-9
   * - 空格
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ","
   * @returns
   * - 0：方法调用成功
   * - < 0：方法调用失败
  /**
   * @description Joins the channel with a user account.
   *
   * After the user successfully joins the channel, the SDK triggers the following callbacks:
   * - The local client: localUserRegistered and userInfoUpdated.
   * - The remote client: userJoined and userInfoUpdated, if the user joining the channel is in the Communication profile, or is a BROADCASTER in the Live Broadcast profile.
   *
   * **Note**: To ensure smooth communication, use the same parameter type to identify the user. For example, if a user joins the channel with a user ID, then ensure all the other users use the user ID too.
   * The same applies to the user account. If a user joins the channel with the Agora Web SDK, ensure that the `uid` of the user is set to the same parameter type.
   * @param {string} token The token generated at your server.
   * - For low-security requirements: You can use the temporary token generated at Dashboard. For details, see [Get a temporary token](https://docs.agora.io/en/Voice/token?platform=All%20Platforms#get-a-temporary-token).
   * - For high-security requirements: Set it as the token generated at your server. For details, see [Get a token](https://docs.agora.io/en/Voice/token?platform=All%20Platforms#get-a-token).
   * @param {string} channel The channel name. The maximum length of this parameter is 64 bytes. Supported character scopes are:
   * - The 26 lowercase English letters: a to z.
   * - The 26 uppercase English letters: A to Z.
   * - The 10 numbers: 0 to 9.
   * - The space.
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @param {string} userAccount The user account. The maximum length of this parameter is 255 bytes. Ensure that you set this parameter and do not set it as null.
   * Supported character scopes are:
   * - The 26 lowercase English letters: a to z.
   * - The 26 uppercase English letters: A to Z.
   * - The 10 numbers: 0 to 9.
   * - The space.
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  joinChannelWithUserAccount(token: string, channel: string, userAccount: string): number {
    return this.rtcEngine.joinChannelWithUserAccount(token, channel, userAccount)
  }

  /** @zh-cn
   * 通过 User Account 获取用户信息。
   * 远端用户加入频道后，SDK 会获取到该远端用户的 UID 和 User Account，然后缓存一个包含了远端用户 UID 和 User Account 的 Mapping 表，
   并在本地触发 userInfoUpdated 回调。收到这个回调后，你可以调用该方法，通过传入 User Account 获取包含了指定用户 UID 的 UserInfo 对象。
   * @param userAccount 用户 User Account。该参数为必填
   * @param errCode ErrorCode的指针，可以为空
   * @param userInfo [in/out] 标识用户信息的 UserInfo 对象
   * - 输入值：一个 UserInfo 对象
   * - 输出值：一个包含了用户 User Account 和 UID 的 UserInfo 对象
   * @returns
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Gets the user information by passing in the user account.
   *
   * After a remote user joins the channel, the SDK gets the user ID and user account of the remote user, caches them in a mapping table object (UserInfo),
   * and triggers the userInfoUpdated callback on the local client.
   * After receiving the callback, you can call this method to get the user ID of the remote user from the UserInfo object by passing in the user account.
   * @param  userAccount The user account. Ensure that you set this parameter.
   * @param errCode Error code.
   * @param userInfo [in/out] A UserInfo object that identifies the user:
   * - Input: A UserInfo object.
   * - Output: A UserInfo object that contains the user account and user ID of the user.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  getUserInfoByUserAccount(userAccount: string): {errCode: number, userInfo: UserInfo} {
    return this.rtcEngine.getUserInfoByUserAccount(userAccount)
  }

  /** @zh-cn
   * 通过 UID 获取用户信息。
   *
   * 远端用户加入频道后， SDK 会获取到该远端用户的 UID 和 User Account，然后缓存一个包含了远端用户 UID 和 User Account 的 Mapping 表，并在本地触发 userInfoUpdated 回调。
   收到这个回调后，你可以调用该方法，通过传入 UID 获取包含了指定用户 User Account 的 UserInfo 对象。
   * @param uid 用户 UID。该参数为必填
   * @param errCode ErrorCode的指针，可以为空
   * @param userInfo [in/out] 标识用户信息的 UserInfo 对象
   * - 输入值：一个 UserInfo 对象
   * - 输出值：一个包含了用户 User Account 和 UID 的 UserInfo 对象
   * @returns
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Gets the user information by passing in the user ID.
   *
   * After a remote user joins the channel, the SDK gets the user ID and user account of the remote user, caches them in a mapping table object (UserInfo), and triggers the userInfoUpdated callback on the local client.
   * After receiving the callback, you can call this method to get the user account of the remote user from the UserInfo object by passing in the user ID.
   * @param uid The user ID. Ensure that you set this parameter.
   * @param errCode Error code.
   * @param userInfo [in/out] A UserInfo object that identifies the user:
   * - Input: A UserInfo object.
   * - Output: A UserInfo object that contains the user account and user ID of the user.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  getUserInfoByUid(uid: number): {errCode: number, userInfo: UserInfo}  {
    return this.rtcEngine.getUserInfoByUid(uid)
  }
  /** @zh-cn
   * 调节录音音量。
   *
   * @param {nummber} volume 录音信号音量，可在 0~400 范围内进行调节：
   * - 0：静音
   * - 100：原始音量
   * - 400：最大可为原始音量的 4 倍（自带溢出保护）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Adjusts the recording volume.
   * @param {number} volume Recording volume. The value ranges between 0 and 400:
   * - 0: Mute.
   * - 100: Original volume.
   * - 400: (Maximum) Four times the original volume with signal-clipping protection.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  adjustRecordingSignalVolume(volume: number): number {
    return this.rtcEngine.adjustRecordingSignalVolume(volume)
  }
  /** @zh-cn
   * 调节播放音量。
   *
   * @param {nummber} volume 播放信号音量，可在 0~400 范围内进行调节：
   * - 0：静音
   * - 100：原始音量
   * - 400：最大可为原始音量的 4 倍（自带溢出保护）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Adjusts the playback volume.
   * @param volume Playback volume. The value ranges between 0 and 400:
   * - 0: Mute.
   * - 100: Original volume.
   * - 400: (Maximum) Four times the original volume with signal-clipping protection.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  adjustPlaybackSignalVolume(volume: number): number {
    return this.rtcEngine.adjustPlaybackSignalVolume(volume)
  }

  // ===========================================================================
  // DEVICE MANAGEMENT
  // ===========================================================================
  /** @zh-cn
   * 设置外部音频采集参数。
   * @param {boolean} enabled 是否开启外部音频采集：
   * - true：开启外部音频采集
   * - false：关闭外部音频采集（默认）
   * @param {number} samplerate 外部音频源的采样率，可设置为 8000，16000，32000，44100 或 48000
   * @param {number} channels 外部音频源的通道数（最多支持两个声道）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the external audio source.
   * @param {boolean} enabled Sets whether to enable/disable the external audio sink:
   * - true: Enable the external audio source.
   * - false: (Default) Disable the external audio source.
   * @param {number} samplerate Sets the sample rate of the external audio source, which can be set as 8000, 16000, 32000, 44100, or 48000 Hz.
   * @param {number} channels Sets the number of external audio source channels (two channels maximum).
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setExternalAudioSource(enabled: boolean, samplerate: number, channels: number): number {
    return this.rtcEngine.setExternalAudioSource(enabled, samplerate, channels);
  }

  /** @zh-cn
   * 获取视频设备。
   * @returns {Array} 视频设备的 Array
   */
  /**
   * @description Gets the list of the video devices.
   * @returns {Array} The array of the video devices.
   */
  getVideoDevices(): Array<Object> {
    return this.rtcEngine.getVideoDevices();
  }

  /** @zh-cn
   * 设置视频设备。
   * @param {string} deviceId 设备 ID
   * @returns {number}
   * - true：方法调用成功
   * - false：方法调用失败
   */
  /**
   * @description Sets the video device using the device Id.
   * @param {string} deviceId The device Id.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setVideoDevice(deviceId: string): number {
    return this.rtcEngine.setVideoDevice(deviceId);
  }

  /** @zh-cn
   * 获取当前的视频设备。
   * @return {Object} 视频设备对象
   */
  /**
   * @description Gets the current video device.
   * @return {Object} The video device.
   */
  getCurrentVideoDevice(): Object {
    return this.rtcEngine.getCurrentVideoDevice();
  }

  /** @zh-cn
   * 开始视频设备测试。
   *
   * 该方法测试视频采集设备是否正常工作。
   * **Note**：请确保在调用该方法前已调用 {@link enableVideo}，且输入视频的 HWND 手柄是有效的。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Starts a video-capture device test.
   *
   * **Note**:
   * This method tests whether the video-capture device works properly.
   * Ensure that you call the {@link enableVideo} method before calling this method and that the HWND window handle of the incoming parameter is valid.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  startVideoDeviceTest(): number {
    return this.rtcEngine.startVideoDeviceTest();
  }

  /** @zh-cn
   * 停止视频设备测试。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops the video-capture device test.
   *
   * **Note**:
   * This method stops testing the video-capture device.
   * You must call this method to stop the test after calling the {@link startVideoDeviceTest} method.
   *
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  stopVideoDeviceTest(): number {
    return this.rtcEngine.stopVideoDeviceTest();
  }

  /** @zh-cn
   * 获取音频播放设备列表。
   * @returns {Array} 音频播放设备的 Array
   */
  /**
   * @description Retrieves the audio playback device associated with the device ID.
   * @returns {Array} The array of the audio playback device.
   */
  getAudioPlaybackDevices(): Array<Object> {
    return this.rtcEngine.getAudioPlaybackDevices();
  }

  /** @zh-cn
   * 通过设备 ID 指定音频播放设备
   * @param {string} deviceId 音频播放设备的 ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the audio playback device using the device ID.
   * @param {string} deviceId The device ID of the audio playback device.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioPlaybackDevice(deviceId: string): number {
    return this.rtcEngine.setAudioPlaybackDevice(deviceId);
  }
  /** @zh-cn
   * 获取播放设备信息。
   * @param {string} deviceId 设备 ID
   * @param {string} deviceName 设备名称
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Retrieves the audio playback device information associated with the device ID and device name.
   * @param {string} deviceId The device ID of the audio playback device.
   * @param {string} deviceName The device name of the audio playback device.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */

  getPlaybackDeviceInfo(deviceId: string, deviceName: string): number {
    return this.rtcEngine.getPlaybackDeviceInfo(deviceId, deviceName);
  }

  /** @zh-cn
   * 获取当前的音频播放设备。
   * @return {Object} 音频播放设备对象
   */
  /**
   * @description Gets the current audio playback device.
   * @return {Object} The current audio playback device.
   */
  getCurrentAudioPlaybackDevice(): Object {
    return this.rtcEngine.getCurrentAudioPlaybackDevice();
  }

  /** @zh-cn
   * 设置音频播放设备的音量
   * @param {number} volume 音量，取值范围为 [0, 255]
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the volume of the audio playback device.
   * @param {number} volume Sets the volume of the audio playback device. The value ranges between 0 (lowest volume) and 255 (highest volume).
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioPlaybackVolume(volume: number): number {
    return this.rtcEngine.setAudioPlaybackVolume(volume);
  }

  /** @zh-cn
   * 获取音频播放设备的音量
   * @returns {number} 音量
   */
  /**
   * @description Retrieves the volume of the audio playback device.
   * @returns {number} The audio playback device volume.
   */
  getAudioPlaybackVolume(): number {
    return this.rtcEngine.getAudioPlaybackVolume();
  }

  /** @zh-cn
   * 获取音频录制设备
   * @returns {Array} 音频录制设备的 Array
   */
  /**
   * @description Retrieves the audio recording device associated with the device ID.
   * @returns {Array} The array of the audio recording device.
   */
  getAudioRecordingDevices(): Array<Object> {
    return this.rtcEngine.getAudioRecordingDevices();
  }

  /** @zh-cn
   * 设备音频录制设备
   * @param {string} deviceId 设备 ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the audio recording device using the device ID.
   * @param {string} deviceId The device ID of the audio recording device.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioRecordingDevice(deviceId: string): number {
    return this.rtcEngine.setAudioRecordingDevice(deviceId);
  }

  /** @zh-cn
   * 获取录制设备信息。
   * @param {string} deviceId 设备 ID
   * @param {string} deviceName 设备名
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Retrieves the audio recording device information associated with the device ID and device name.
   * @param {string} deviceId The device ID of the recording audio device.
   * @param {string} deviceName  The device name of the recording audio device.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  getRecordingDeviceInfo(deviceId: string, deviceName: string): number {
    return this.rtcEngine.getRecordingDeviceInfo(deviceId, deviceName);
  }

  /** @zh-cn
   * 获取当前的音频录制设备。
   * @returns {Object} 音频录制设备对象
   */
  /**
   * @description Gets the current audio recording device.
   * @returns {Object} The audio recording device.
   */
  getCurrentAudioRecordingDevice(): Object {
    return this.rtcEngine.getCurrentAudioRecordingDevice();
  }

  /** @zh-cn
   * 获取录制设备的音量。
   * @return {number} 音量
   */
  /**
   * @description Retrieves the volume of the microphone.
   * @return {number} The microphone volume. The volume value ranges between 0 (lowest volume) and 255 (highest volume).
   */
  getAudioRecordingVolume(): number {
    return this.rtcEngine.getAudioRecordingVolume();
  }

  /** @zh-cn
   * 设置录音设备的音量
   * @param {number} volume 录音设备的音量，取值范围为 [0, 255]
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the volume of the microphone.
   * @param {number} volume Sets the volume of the microphone. The value ranges between 0 (lowest volume) and 255 (highest volume).
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioRecordingVolume(volume: number): number {
    return this.rtcEngine.setAudioRecordingVolume(volume);
  }

  /** @zh-cn
   * 开始音频播放设备测试。
   *
   * 该方法检测音频播放设备是否正常工作。SDK 会播放用户指定的音乐文件，如果用户可以听到声音，则说明播放设备正常工作。
   * @param {string} filepath 用来测试的音乐文件的路径
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Starts the audio playback device test.
   *
   * This method tests if the playback device works properly. In the test, the SDK plays an audio file specified by the user.
   * If the user can hear the audio, the playback device works properly.
   * @param {string} filepath The path of the audio file for the audio playback device test in UTF-8:
   * - Supported file formats: wav, mp3, m4a, and aac.
   * - Supported file sample rates: 8000, 16000, 32000, 44100, and 48000 Hz.
   * @returns {number}
   * - 0: Success, and you can hear the sound of the specified audio file.
   * - < 0: Failure.
   */
  startAudioPlaybackDeviceTest(filepath: string): number {
    return this.rtcEngine.startAudioPlaybackDeviceTest(filepath);
  }

  /** @zh-cn
   * 停止播放设备测试。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops the audio playback device test.
   *
   * This method stops testing the audio playback device.
   * You must call this method to stop the test after calling the {@link startAudioPlaybackDeviceTest} method.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  stopAudioPlaybackDeviceTest(): number {
    return this.rtcEngine.stopAudioPlaybackDeviceTest();
  }

  /** @zh-cn
   * 开始音频设备回路测试。
   *
   * 该方法测试本地的音频设备是否正常工作。
   * 调用该方法后，麦克风会采集本地语音并通过扬声器播放出来，用户需要配合说一段话。SDK 会通过 groupAudioVolumeIndication 回调向 App 上报音量信息。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Starts the audio device loopback test.
   *
   * This method tests whether the local audio devices are working properly.
   * After calling this method, the microphone captures the local audio and plays it through the speaker.
   *
   * **Note**:
   * This method tests the local audio devices and does not report the network conditions.
   * @param {number} interval The time interval (ms).
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  startAudioDeviceLoopbackTest(interval: number): number {
    return this.rtcEngine.startAudioDeviceLoopbackTest(interval);
  }

  /** @zh-cn
   * 停止音频设备回路测试。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops the audio device loopback test.
   *
   * **Note**:
   * Ensure that you call this method to stop the loopback test after calling the {@link startAudioDeviceLoopbackTest} method.
   *
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  stopAudioDeviceLoopbackTest(): number {
    return this.rtcEngine.stopAudioDeviceLoopbackTest();
  }

  /** @zh-cn
   * 开启声卡采集。
   *
   * 一旦开启声卡采集，SDK 会采集本地所有的声音。
   *
   * @param {boolean} enable 是否开启声卡采集：
   * - true：开启声卡采集
   * - false：关闭声卡采集（默认）
   * @param {string|null} deviceName 声卡的设备名。默认设为 null，即使用当前声卡采集。如果用户使用虚拟声卡，如 “Soundflower”，可以将虚拟声卡名称 “Soundflower” 作为参数，SDK 会找到对应的虚拟声卡设备，并开始采集。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Enables the loopback recording. Once enabled, the SDK collects all local sounds.
   * @param {boolean} [enable = false] Enable the loop back recording.
   * @param {string|null} [deviceName = null] The audio device.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  enableLoopbackRecording(enable = false, deviceName: string | null = null): number {
    return this.rtcEngine.enableLoopbackRecording(enable, deviceName);
  }

  /** @zh-cn
   * 开始音频录制设备测试。
   *
   * 该方法测试麦克风是否正常工作。开始测试后，SDK 会通过 groupAudioVolumeIndication 回调向 App 上报音量信息。
   * @param {number} indicateInterval 返回音量的间隔时间，单位为秒
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Starts the microphone test.
   *
   * This method checks whether the microphone works properly.
   * @param {number} indicateInterval The interval period (ms).
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  startAudioRecordingDeviceTest(indicateInterval: number): number {
    return this.rtcEngine.startAudioRecordingDeviceTest(indicateInterval);
  }

  /** @zh-cn
   * 停止音频录制设备测试。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops the microphone test.
   *
   * **Note**:
   * This method stops the microphone test.
   * You must call this method to stop the test after calling the {@link startAudioRecordingDeviceTest} method.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  stopAudioRecordingDeviceTest(): number {
    return this.rtcEngine.stopAudioRecordingDeviceTest();
  }

  /** @zh-cn
   * 获取当前音频播放设备的静音状态。
   * @returns {boolean}
   * - true：当前音频播放设备静音
   * - false：当前音频播放设备不静音
   */
  /**
   * @description check whether selected audio playback device is muted
   * @returns {boolean} muted/unmuted
   */
  getAudioPlaybackDeviceMute(): boolean {
    return this.rtcEngine.getAudioPlaybackDeviceMute();
  }

  /** @zh-cn
   * 设置当前音频播放设备为静音/不静音。
   * @param {boolean} mute 是否设置当前音频播放设备静音：
   * - true：设置当前音频播放设备静音
   * - false：设置当前音频播放设备不静音
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Mutes the audio playback device.
   * @param {boolean} mute Sets whether to mute/unmute the audio playback device:
   * - true: Mutes.
   * - false: Unmutes.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioPlaybackDeviceMute(mute: boolean): number {
    return this.rtcEngine.setAudioPlaybackDeviceMute(mute);
  }

  /** @zh-cn
   * 获取当前音频录制设备的静音状态。
   * @returns {boolean}
   * - true：当前音频录制设备静音
   * - false：当前音频录制设备不静音
   */
  /**
   * @description Retrieves the mute status of the audio playback device.
   * @returns {boolean} Whether to mute/unmute the audio playback device:
   * - true: Mutes.
   * - false: Unmutes.
   */
  getAudioRecordingDeviceMute(): boolean {
    return this.rtcEngine.getAudioRecordingDeviceMute();
  }

  /** @zh-cn
   * 设置当前音频录制设备静音/不静音。
   * @param {boolean} mute 是否设置当前音频录制设备静音：
   * - true：设置当前音频录制设备静音
   * - false：设置当前音频录制设备不静音
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Mutes/Unmutes the microphone.
   * @param {boolean} mute Sets whether to mute/unmute the audio playback device:
   * - true: Mutes.
   * - false: Unmutes.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioRecordingDeviceMute(mute: boolean): number {
    return this.rtcEngine.setAudioRecordingDeviceMute(mute);
  }

  // ===========================================================================
  // VIDEO SOURCE
  // NOTE. video source is mainly used to do screenshare, the api basically
  // aligns with normal sdk apis, e.g. videoSourceInitialize vs initialize.
  // it is used to do screenshare with a separate process, in that case
  // it allows user to do screensharing and camera stream pushing at the
  // same time - which is not allowed in single sdk process.
  // if you only need to display camera and screensharing one at a time
  // use sdk original screenshare, if you want both, use video source.
  // ===========================================================================
  /** @zh-cn
   * 初始化屏幕共享对象
   * @param {string} appId 你在 Agora Dashbaord 创建的项目 ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Initializes agora real-time-communicating video source with the app Id.
   * @param {string} appId The app ID issued to you by Agora.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceInitialize(appId: string): number {
    return this.rtcEngine.videoSourceInitialize(appId);
  }

  /** @zh-cn
   * 设置屏幕共享的渲染器
   * @param {Element} view 播放屏幕共享的 Dom
   */
  /**
   * @description Sets the video renderer for video source.
   * @param {Element} view The dom element where video source should be displayed.
   */
  setupLocalVideoSource(view: Element): void {
    this.initRender('videosource', view);
  }

  /** @zh-cn
   * 开启与 Web SDK 的屏幕共享互通。
   *
   * **Note**：该方法需要在 {@link videoSourceInitialize} 之后调用。
   * @param {boolean} enabled 是否开启与 Web SDK 之间的互通：
   * - true：开启与 Web SDK 的互通
   * - false：不开启与 Web SDK 的互通
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Enables the web interoperability of the video source, if you set it to true.
   *
   * **Note**:
   * You must call this method after calling the {@link videoSourceInitialize} method.
   *
   * @param {boolean} enabled Set whether or not to enable the web interoperability of the video source.
   * - true: Enables the web interoperability.
   * - false: Disables web interoperability.
   *
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceEnableWebSdkInteroperability(enabled: boolean): number {
    return this.rtcEngine.videoSourceEnableWebSdkInteroperability(enabled);
  }

  /** @zh-cn
   *
   * 屏幕共享对象加入频道。
   * @param {string} token 在 App 服务器端生成的用于鉴权的 Token：
   * - 安全要求不高：你可以填入在 Agora Dashboard 获取到的临时 Token。详见[获取临时 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取临时-token)
   * - 安全要求高：将值设为在 App 服务端生成的正式 Token。详见[获取 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取正式-token)
   * @param {string} cname 标识频道的频道名，最大不超过 64 字节。以下为支持的字符集范围（共 89 个字符）：
   * - 26 个小写英文字母 a-z
   * - 26 个大写英文字母 A-Z
   * - 10 个数字 0-9
   * - 空格
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ","
   * @param {string} info 频道信息
   * @param {number} uid 用户 ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Allows a user to join a channel when using the video source.
   *
   * @param {string} token The token generated at your server:
   * - For low-security requirements: You can use the temporary token generated at Dashboard. For details, see [Get a temporary token](https://docs.agora.io/en/Voice/token?platform=All%20Platforms#get-a-temporary-token).
   * - For high-security requirements: Set it as the token generated at your server. For details, see [Get a token](https://docs.agora.io/en/Voice/token?platform=All%20Platforms#get-a-token).
   * @param {string} cname (Required) Pointer to the unique channel name for the Agora RTC session in the string format smaller than 64 bytes. Supported characters:
   * - The 26 lowercase English letters: a to z.
   * - The 26 uppercase English letters: A to Z.
   * - The 10 numbers: 0 to 9.
   * - The space.
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @param {string} info Pointer to additional information about the channel. This parameter can be set to NULL or contain channel related information.
   * Other users in the channel will not receive this message.
   * @param {number} uid The User ID.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceJoin(
    token: string,
    cname: string,
    info: string,
    uid: number
  ): number {
    return this.rtcEngine.videoSourceJoin(token, cname, info, uid);
  }

  /** @zh-cn
   * 屏幕共享对象离开频道。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Allows a user to leave a channe when using the video source.
   *
   * **Note**:
   * You must call this method after calling the {@link videoSourceJoin} method.
   *
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceLeave(): number {
    return this.rtcEngine.videoSourceLeave();
  }

  /** @zh-cn
   * 更新屏幕共享对象的 Token
   * @param {string} token 需要更新的新 Token
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Gets a new token for a user using the video source when the current token expires after a period of time.
   *
   * The application should call this method to get the new `token`.
   * Failure to do so will result in the SDK disconnecting from the server.
   *
   * @param {string} token The new token.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceRenewToken(token: string): number {
    return this.rtcEngine.videoSourceRenewToken(token);
  }

  /** @zh-cn
   * 设置屏幕共享对象的频道模式。
   * @param {number} profile 频道模式：
   * - 0：通信模式（默认）
   * - 1：直播模式
   * - 2：游戏模式
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the channel profile when using the video source.
   *
   * @param {number} profile Sets the channel profile:
   * - 0:(Default) Communication.
   * - 1: Live Broadcast.
   * - 2: Gaming.
   *
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceSetChannelProfile(profile: number): number {
    return this.rtcEngine.videoSourceSetChannelProfile(profile);
  }

  /** @zh-cn
   * 设置屏幕共享的视频属性。
   *
   * **Note**：请在 {@link startScreenCapture2} 后调用该方法。
   * @param {VIDEO_PROFILE_TYPE} profile 视频属性，详见 {@link VIDEO_PROFILE_TYPE}
   * @param {boolean} swapWidthAndHeight 是否交换视频的宽和高：
   * - true：交换视频的宽和高
   * - false：不交换视频的宽和高（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the video profile when using the video source.
   * @param {VIDEO_PROFILE_TYPE} profile The video profile. See {@link VIDEO_PROFILE_TYPE}.
   * @param {boolean} [swapWidthAndHeight = false] Whether to swap width and height:
   * - true: Swap the width and height.
   * - false: Do not swap the width and height.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceSetVideoProfile(profile: VIDEO_PROFILE_TYPE, swapWidthAndHeight = false): number {
    return this.rtcEngine.videoSourceSetVideoProfile(profile, swapWidthAndHeight);
  }

  /** @zh-cn
   * 获取系统窗口 ID。
   *
   * 该方法获取所有系统窗口 ID，以及相关信息。你可以使用获取到的窗口 ID 进行屏幕共享。
   * @returns {Array} 系统窗口 ID 和相关信息列表
   */
  /**
   * @description Gets the window ID when using the video source.
   *
   * This method gets the ID of the whole window and relevant inforamtion.
   * You can share the whole or part of a window by specifying the window ID.
   * @returns {Array} The array list of the window ID and relevant information.
   */
  getScreenWindowsInfo(): Array<Object> {
    return this.rtcEngine.getScreenWindowsInfo();
  }

  /** @zh-cn
   * 获取屏幕 ID。
   *
   * 该方法获取所有的系统屏幕 ID，以及相关信息。你可以使用获取到的屏幕 ID 进行屏幕共享。
   * @returns {Array} 系统屏幕 ID 和相关信息列表
   */
  /**
   * @description Gets the display ID when using the video source.
   *
   * This method gets the ID of the whole display and relevant inforamtion.
   * You can share the whole or part of a display by specifying the window ID.
   * @returns {Array} The array list of the display ID and relevant information.
   */
  getScreenDisplaysInfo(): Array<Object> {
    return this.rtcEngine.getScreenDisplaysInfo();
  }

  /** @zh-cn
   * @deprecated 该方法已废弃，请改用 {@link videoSourceStartScreenCaptureByScreen} 或 {@link videoSourceStartScreenCaptureByWindow}。
   * 开始屏幕共享。
   * @param {number} windowId 需要采集的窗口 ID
   * @param {number} captureFreq 屏幕共享帧率，单位为 fps，取值范围为 [1, 15]
   * @param {*} rect 共享窗口相对于屏幕左上角的相对位置和大小，可设为 null
   * @param {number} bitrate 屏幕共享的比特率，单位为 Kbps
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated. Use {@link videoSourceStartScreenCaptureByScreen} or {@link videoSourceStartScreenCaptureByWindow} instead.
   * @description Starts the video source.
   * @param {number} wndid Sets the video source area.
   * @param {number} captureFreq (Mandatory) The captured frame rate. The value ranges between 1 fps and 15 fps.
   * @param {*} rect Specifies the video source region. `rect` is valid when `wndid` is set as 0. When `rect` is set as NULL, the whole screen is shared.
   * @param {number} bitrate The captured bitrate.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  startScreenCapture2(
    windowId: number,
    captureFreq: number,
    rect: {left: number, right: number, top: number, bottom: number},
    bitrate: number
  ): number {
    deprecate('"videoSourceStartScreenCaptureByScreen" or "videoSourceStartScreenCaptureByWindow"');
    return this.rtcEngine.startScreenCapture2(windowId, captureFreq, rect, bitrate);
  }

  /** @zh-cn
   * 停止屏幕共享。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stop the video source.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  stopScreenCapture2(): number {
    return this.rtcEngine.stopScreenCapture2();
  }

  /** @zh-cn
   * 开始屏幕共享预览。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Starts the video source preview.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  startScreenCapturePreview(): number {
    return this.rtcEngine.videoSourceStartPreview();
  }

  /** @zh-cn
   * 停止屏幕共享预览。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops the video source preview.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  stopScreenCapturePreview(): number {
    return this.rtcEngine.videoSourceStopPreview();
  }

  /** @zh-cn
   * 开始屏幕共享流的双流模式。
   * @param {boolean} enable 是否开始双流模式：
   * - true：开启屏幕共享双流模式
   * - false：不开启屏幕共享双流模式（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Enables the dual-stream mode for the video source.
   * @param {boolean} enable Whether or not to enable the dual-stream mode:
   * - true: Enables the dual-stream mode.
   * - false: Disables the dual-stream mode.
  * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceEnableDualStreamMode(enable: boolean): number {
    return this.rtcEngine.videoSourceEnableDualStreamMode(enable);
  }

  /** @zh-cn
   * 双实例方法：启用定制功能。
   * @param {string} parameter 要设置的参数。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the video source parameters.
   * @param {string} parameter Sets the video source encoding parameters.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceSetParameters(parameter: string): number {
    return this.rtcEngine.videoSourceSetParameter(parameter);
  }

  /** @zh-cn
   * 更新屏幕共享区域。
   * @param {*} rect {left: 0, right: 100, top: 0, bottom: 100} 共享窗口相对于屏幕左上角的相对位置和大小，可设为 null
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Updates the screen capture region for the video source.
   * @param {*} rect {left: 0, right: 100, top: 0, bottom: 100} (relative distance from the left-top corner of the screen)
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceUpdateScreenCaptureRegion(rect: {
    left: number,
    right: number,
    top: number,
    bottom: number
  }) {
    return this.rtcEngine.videoSourceUpdateScreenCaptureRegion(rect);
  }

  /** @zh-cn
   * 释放屏幕共享对象。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Releases the video source object.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceRelease(): number {
    return this.rtcEngine.videoSourceRelease();
  }

  // 2.4 new Apis
  /** @zh-cn
   * 通过指定区域共享屏幕。
   * @param {ScreenSymbol} screenSymbol 屏幕标识：
   * - macOS 系统中，指屏幕 ID
   * - Windows 系统中，指屏幕位置
   * @param {CaptureRect} rect 待共享区域相对于整个屏幕的位置
   * @param {CaptureParam} param 屏幕共享的编码参数配置
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Shares the whole or part of a screen by specifying the screen rect.
   * @param {ScreenSymbol} screenSymbol The display ID：
   * - macOS: The display ID.
   * - Windows: The screen rect.
   * @param {CaptureRect} rect Sets the relative location of the region to the screen.
   * @param {CaptureParam} param Sets the video source encoding parameters.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceStartScreenCaptureByScreen(screenSymbol: ScreenSymbol, rect: CaptureRect, param: CaptureParam): number {
    return this.rtcEngine.videosourceStartScreenCaptureByScreen(screenSymbol, rect, param);
  }

  /** @zh-cn
   * 通过指定窗口 ID 共享窗口。
   * @param {number} windowSymbol 窗口 ID
   * @param {CaptureRect} rect 待共享区域相对于整个窗口的位置
   * @param {CaptureParam} param 屏幕共享的编码参数配置
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Shares the whole or part of a window by specifying the window ID.
   * @param {number} windowSymbol The ID of the window to be shared.
   * @param {CaptureRect} rect The ID of the window to be shared.
   * @param {CaptureParam} param Sets the video source encoding parameters.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceStartScreenCaptureByWindow(windowSymbol: number, rect: CaptureRect, param: CaptureParam): number {
    return this.rtcEngine.videosourceStartScreenCaptureByWindow(windowSymbol, rect, param);
  }

  /** @zh-cn
   * 更新屏幕共享参数配置。
   * @param {CaptureParam} param 屏幕共享的编码参数配置
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Updates the video source parameters.
   * @param {CaptureParam} param Sets the video source encoding parameters.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceUpdateScreenCaptureParameters(param: CaptureParam): number {
    return this.rtcEngine.videosourceUpdateScreenCaptureParameters(param);
  }

  /** @zh-cn
   * 设置屏幕共享内容类型。
   * @param {VideoContentHint} hint 屏幕共享的内容类型
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description  Updates the video source parameters.
   * @param {VideoContentHint} hint Sets the content hint for the video source.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceSetScreenCaptureContentHint(hint: VideoContentHint): number {
    return this.rtcEngine.videosourceSetScreenCaptureContentHint(hint);
  }



  // ===========================================================================
  // SCREEN SHARE
  // When this api is called, your camera stream will be replaced with
  // screenshare view. i.e. you can only see camera video or screenshare
  // one at a time via this section's api
  // ===========================================================================
  /** @zh-cn
   * @deprecated 该方法已废弃。请改用 {@link videoSourceStartScreenCaptureByScreen} 或 {@link videoSourceStartScreenCaptureByWindow}。
   * 开始屏幕共享。
   * @param {number} windowId 待共享的窗口 ID
   * @param {number} captureFreq 屏幕共享的编码帧率，单位为 fps，取值范围为 [1, 15]
   * @param {*} rect 共享窗口相对于屏幕左上角的相对位置和大小，可设为 null
   * @param {number} bitrate 屏幕共享的比特率，单位为 Kbps
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated. Use  {@link videoSourceStartScreenCaptureByScreen} or {@link videoSourceStartScreenCaptureByWindow} instead.
   * @description Starts the screen sharing.
   * @param {number} wndid Sets the screen sharing area.
   * @param {number} captureFreq (Mandatory) The captured frame rate. The value ranges between 1 fps and 15 fps.
   * @param {*} rect Specifies the screen sharing region. `rect` is valid when `wndid` is set as 0. When `rect` is set as NULL, the whole screen is shared.
   * @param {number} bitrate The captured bitrate.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  startScreenCapture(
    windowId: number,
    captureFreq: number,
    rect: {left: number, right: number, top: number, bottom: number},
    bitrate: number
  ): number {
    deprecate();
    return this.rtcEngine.startScreenCapture(windowId, captureFreq, rect, bitrate);
  }

  /** @zh-cn
   * 停止屏幕共享。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops screen sharing.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  stopScreenCapture(): number {
    return this.rtcEngine.stopScreenCapture();
  }

  /** @zh-cn
   * 更新屏幕共享区域。
   * @param {*} rect {left: 0, right: 100, top: 0, bottom: 100} 共享窗口相对于屏幕左上角的相对位置和大小，可设为 null
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Updates the screen capture region.
   * @param {*} rect {left: 0, right: 100, top: 0, bottom: 100} (relative distance from the left-top corner of the screen)
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  updateScreenCaptureRegion(
    rect: {
      left: number,
      right: number,
      top: number,
      bottom: number
    }
  ): number {
    return this.rtcEngine.updateScreenCaptureRegion(rect);
  }

  // ===========================================================================
  // AUDIO MIXING
  // ===========================================================================
  /** @zh-cn
   * 开始播放音乐文件及混音。
   *
   * 该方法指定本地或在线音频文件来和麦克风采集的音频流进行混音或替换。替换是指用音频文件替换麦克风采集的音频流。该方法可以选择是否让对方听到本地播放的音频，并指定循环播放的次数。
   * 音乐文件开始播放后，本地会收到 audioMixingStateChanged 回调，报告音乐文件播放状态发生改变。
   * @param {string} filepath 指定需要混音的本地或在线音频文件的绝对路径。支持的音频格式包括：mp3、mp4、m4a、aac、3gp、mkv 及 wav
   * @param {boolean} loopback
   * - true：只有本地可以听到混音或替换后的音频流
   * - false：本地和对方都可以听到混音或替换后的音频流
   * @param {boolean} replace
   * - true：只推动设置的本地音频文件或者线上音频文件，不传输麦克风收录的音频
   * - false：音频文件内容将会和麦克风采集的音频流进行混音
   * @param {number} cycle 指定音频文件循环播放的次数：
   * - 正整数：循环的次数
   * - -1：无限循环
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *
   */
  /**
   * @description Starts playing and mixing the music file.
   *
   * This method mixes the specified local audio file with the audio stream
   * from the microphone, or replaces the microphone’s audio stream with the specified
   * local audio file. You can choose whether the other user can hear the local audio playback
   * and specify the number of loop playbacks. This API also supports online music playback.
   *
   * The SDK returns the state of the audio mixing file playback in the audioMixingStateChanged callback.
   *
   * **Note**:
   * - Call this method when you are in the channel, otherwise it may cause issues.
   * - If the local audio mixing file does not exist, or if the SDK does not support the file format
   * or cannot access the music file URL, the SDK returns the warning code 701.
   *
   * @param {string} filepath Specifies the absolute path of the local or online audio file to be mixed.
   *            Supported audio formats: mp3, aac, m4a, 3gp, and wav.
   * @param {boolean} loopback Sets which user can hear the audio mixing:
   * - true: Only the local user can hear the audio mixing.
   * - false: Both users can hear the audio mixing.
   * @param {boolean} replace Sets the audio mixing content:
   * - true: Only publish the specified audio file; the audio stream from the microphone is not published.
   * - false: The local audio file is mixed with the audio stream from the microphone.
   * @param {number} cycle Sets the number of playback loops:
   * - Positive integer: Number of playback loops.
   * - -1: Infinite playback loops.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  startAudioMixing(
    filepath: string,
    loopback: boolean,
    replace: boolean,
    cycle: number
  ): number {
    return this.rtcEngine.startAudioMixing(filepath, loopback, replace, cycle);
  }

  /** @zh-cn
   * 停止播放音乐文件及混音。请在频道内调用该方法。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops playing or mixing the music file.
   *
   * Call this API when you are in a channel.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  stopAudioMixing(): number {
    return this.rtcEngine.stopAudioMixing();
  }

  /** @zh-cn
   * 暂停播放音乐文件及混音。请在频道内调用该方法。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Pauses playing and mixing the music file.
   *
   *  Call this API when you are in a channel.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  pauseAudioMixing(): number {
    return this.rtcEngine.pauseAudioMixing();
  }

  /** @zh-cn
   * 恢复播放音乐文件及混音。请在频道内调用该方法。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Resumes playing and mixing the music file.
   *
   *  Call this API when you are in a channel.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  resumeAudioMixing(): number {
    return this.rtcEngine.resumeAudioMixing();
  }

  /** @zh-cn
   * 调节音乐文件的播放音量。请在频道内调用该方法。
   * @param {number} 音乐文件播放音量，取值范围为 [0, 100]，默认值为 100，表示原始文件音量
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Adjusts the volume of audio mixing.
   *
   *  Call this API when you are in a channel.
   * @param {number} volume Audio mixing volume. The value ranges between 0 and 100 (default).
   * 100 is the original volume.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  adjustAudioMixingVolume(volume: number): number {
    return this.rtcEngine.adjustAudioMixingVolume(volume);
  }

  /** @zh-cn
   * 调节音乐文件的本地播放音量。请在频道内调用该方法。
   * @param {number} 音乐文件的本地播放音量，取值范围为 [0, 100]，默认值为 100，表示原始文件音量
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Adjusts the audio mixing volume for local playback.
   * @param {number} volume Audio mixing volume for local playback. The value ranges between 0 and 100 (default). 100 is the original volume.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  adjustAudioMixingPlayoutVolume(volume: number): number {
    return this.rtcEngine.adjustAudioMixingPlayoutVolume(volume);
  }

  /** @zh-cn
   * 调节音乐文件的远端播放音量。请在频道内调用该方法。
   * @param {number} 音乐文件的远端播放音量，取值范围为 [0, 100]，默认值为 100，表示原始文件音量
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Adjusts the audio mixing volume for publishing (sending to other users).
   * @param {number} volume Audio mixing volume for publishing. The value ranges between 0 and 100 (default). 100 is the original volume.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  adjustAudioMixingPublishVolume(volume: number): number {
    return this.rtcEngine.adjustAudioMixingPublishVolume(volume);
  }

  /** @zh-cn
   * 获取音乐文件的时长。请在频道内调用该方法。如果返回值 < 0，表明调用失败。
   * @returns {number}
   * - < 0：方法调用失败
   * - 其他：方法调用成功，并返回伴奏时长
   */
  /**
   * @description Gets the duration (ms) of the music file.
   *
   * Call this API when you are in a channel.
   * @returns {number}
   * - ≥ 0: The audio mixing duration, if this method call succeeds.
   * - < 0: Failure.
   */
  getAudioMixingDuration(): number {
    return this.rtcEngine.getAudioMixingDuration();
  }

  /** @zh-cn
   * 获取音乐文件的播放进度，单位为毫秒。请在频道内调用该方法。
   * @returns {number}
   * - < 0：方法调用失败
   * - 其他值：方法调用成功并返回伴奏播放进度
   */
  /**
   * @description Gets the playback position (ms) of the music file.
   *
   * Call this API when you are in a channel.
   * @returns {number}
   * - ≥ 0: The current playback position of the audio mixing, if this method call succeeds.
   * - < 0: Failure.
   */
  getAudioMixingCurrentPosition(): number {
    return this.rtcEngine.getAudioMixingCurrentPosition();
  }

  /**
   * @description Adjusts the audio mixing volume for publishing (for remote users).
   *
   * Call this API when you are in a channel.
   *
   * @returns {number}
   * - ≥ 0: The audio mixing volume for local playout, if this method call succeeds. The value range is [0,100].
   * - < 0: Failure.
   */
  getAudioMixingPlayoutVolume(): number {
    return this.rtcEngine.getAudioMixingPlayoutVolume();
  }

  /**
   * @description Retrieves the audio mixing volume for publishing.
   *
   * Call this API when you are in a channel.
   *
   * @returns {number}
   * - ≥ 0: The audio mixing volume for publishing, if this method call succeeds. The value range is [0,100].
   * - < 0: Failure.
   */
  getAudioMixingPublishVolume(): number {
    return this.rtcEngine.getAudioMixingPublishVolume();
  }

  /** @zh-cn
   * 设置音乐文件的播放位置。
   *
   * 该方法可以设置音频文件的播放位置，这样你可以根据实际情况播放文件，而不是非得从头到尾播放一个文件。
   *
   * @param {number} 表示当前播放进度的整数，单位为毫秒
   * @returns
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the playback position of the music file to a different starting position.
   *
   * This method drags the playback progress bar of the audio mixing file to where
   * you want to play instead of playing it from the beginning.
   * @param {number} position The playback starting position (ms) of the music file.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioMixingPosition(position: number): number {
    return this.rtcEngine.setAudioMixingPosition(position);
  }

  // ===========================================================================
  // CDN STREAMING
  // ===========================================================================
  /** @zh-cn
   * 增加旁路推流地址。
   *
   * 调用该方法后，SDK 会在本地触发 streamPublished 回调，报告增加旁路推流地址的状态。
   *
   * **Note**：
   * - 请在加入频道后调用该方法。
   * - 该方法每次只能增加一路旁路推流地址。若需推送多路流，则需多次调用该方法。
   * - 推流地址不支持中文等特殊字符，
   * - 该方法仅适用于直播模式。
   * @param {string} CDN 推流地址，格式为 RTMP。该字符长度不能超过 1024 字节
   * @param {bool} transcodingEnabled 设置是否转码：
   * - true：转码。[转码](https://docs.agora.io/cn/Agora%20Platform/terms?platform=All%20Platforms#转码)是指在旁路推流时对音视频流进行转码处理后，再推送到其他 RTMP 服务器。多适用于频道内有多个主播，需要进行混流、合图的场景
   * @returns
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
   /**
    * @description Publishes the local stream to a specified CDN live RTMP address. (CDN live only)
    *
    * The SDK returns the result of this method call in the streamPublished callback.
    * **Note**:
    * - Ensure that the user joins the channel before calling this method.
    * - This method adds only one stream RTMP URL address each time it is called.
    * - The RTMP URL address must not contain special characters, such as Chinese language characters.
    * - This method applies to Live Broadcast only.
    * @param {string} url The CDN streaming URL in the RTMP format. The maximum length of this parameter is 1024 bytes.
    * @param {bool} transcodingEnabled Sets whether transcoding is enabled/disabled:
    * - true: Enable transcoding. To transcode the audio or video streams when publishing them to CDN live,
    * often used for combining the audio and video streams of multiple hosts in CDN live.
    * - false: Disable transcoding.
    * @returns {number}
    * - 0: Success.
    * - < 0: Failure.
    */
  addPublishStreamUrl(url: string, transcodingEnabled: boolean): number {
    return this.rtcEngine.addPublishStreamUrl(url, transcodingEnabled);
  }

  /** @zh-cn
   * 删除旁路推流地址。
   *
   * 调用该方法后，SDK 会在本地触发 streamUnpublished 回调，报告删除旁路推流地址的状态。
   *
   * **Note**：
   * - 该方法每次只能删除一路旁路推流地址。若需删除多路流，则需多次调用该方法。
   * - 推流地址不支持中文等特殊字符。
   * - 该方法只适用于直播模式。
   * @param {string} 待删除的推流地址，格式为 RTMP。该字符长度不能超过 1024 字节
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Removes an RTMP stream from the CDN. (CDN live only)
   * **Note**:
   * - This method removes only one RTMP URL address each time it is called.
   * - The RTMP URL address must not contain special characters, such as Chinese language characters.
   * - This method applies to Live Broadcast only.
   * @param {string} url The RTMP URL address to be removed. The maximum length of this parameter is 1024 bytes.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  removePublishStreamUrl(url: string): number {
    return this.rtcEngine.removePublishStreamUrl(url);
  }

  /** @zh-cn
   * 设置直播转码。
   * @param {TranscodingConfig} 旁路推流布局相关设置
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description ets the video layout and audio settings for CDN live. (CDN live only)
   * @param {TranscodingConfig} transcoding Sets the CDN live audio/video transcoding settings.
   * @return {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setLiveTranscoding(transcoding: TranscodingConfig): number {
    return this.rtcEngine.setLiveTranscoding(transcoding);
  }

  // ===========================================================================
  // STREAM INJECTION
  // ===========================================================================
  /** @zh-cn
   * 导入在线媒体流。
   * 
   * 该方法适用于 Native SDK v2.4.1 及之后的版本。
   *
   * 该方法通过在服务端拉取视频流并发送到频道中，将正在播出的视频导入到正在进行的直播中。
   * 可主要应用于赛事直播、多人看视频互动等直播场景。
   *
   * 调用该方法后，SDK 会在本地触发 streamInjectStatus 回调，报告导入在线媒体流的状态。
   * 成功导入媒体流后，该音视频流会出现在频道中，频道内所有用户都会收到 userJoined 回调，其中 uid 为 666。
   *
   * **Note**：请确保已联系 sales@agora.io 开通旁路直播推流功能。
   * @param {string} 添加到直播中的视频流 URL 地址，支持 RTMP， HLS， FLV 协议传输。
   * - 支持的 FLV 音频编码格式：AAC
   * - 支持的 FLV 视频编码格式：H264 (AVC)
   * @param {InjectStreamConfig} 外部导入的音视频流的配置
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Adds a voice or video stream HTTP/HTTPS URL address to a live broadcast.
   * 
   * This method applies to the Native SDK v2.4.1 and later.
   * 
   * If this method call is successful, the server pulls the voice or video stream and injects it into a live channel. 
   * This is applicable to scenarios where all audience members in the channel can watch a live show and interact with each other.
   *
   * The {@link addInjectStreamUrl} method call triggers the following callbacks:
   * - The local client:
   *  - streamInjectStatus, with the state of the injecting the online stream.
   *  - userJoined (uid: 666), if the method call is successful and the online media stream is injected into the channel.
   * - The remote client:
   *  - userJoined (uid: 666), if the method call is successful and the online media stream is injected into the channel.
   *
   * @param {string} url The HTTP/HTTPS URL address to be added to the ongoing live broadcast. Valid protocols are RTMP, HLS, and FLV.
   * - Supported FLV audio codec type: AAC.
   * - Supported FLV video codec type: H264 (AVC).
   * @param {InjectStreamConfig} config The InjectStreamConfig object which contains the configuration information for the added voice or video stream.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  addInjectStreamUrl(url: string, config: InjectStreamConfig): number {
    return this.rtcEngine.addInjectStreamUrl(url, config);
  }

  /** @zh-cn
   * 删除导入的在线媒体流。
   *
   * **Note**：成功删除后，会触发 removeStream 回调，其中 uid 为 666。
   * @param {string} url 已导入、待删除的外部视频流 URL 地址，格式为 HTTP 或 HTTPS
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Removes the injected online media stream from a live broadcast.
   *
   * @param {string} url HTTP/HTTPS URL address of the added stream to be removed.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  removeInjectStreamUrl(url: string): number {
    return this.rtcEngine.removeInjectStreamUrl(url);
  }


  // ===========================================================================
  // RAW DATA
  // ===========================================================================
  /** @zh-cn
   * 设置录制的声音格式。
   * @param {number} sampleRate 指定返回数据的采样率，可设置为 8000，16000，32000，44100 或 48000。
   * @param {number} channel 指定返回数据的通道数：
   * - 1：单声道
   * - 2：双声道
   * @param {number} mode 指定使用模式：
   * - 0：只读模式，用户仅从 AudioFrame 获取原始音频数据。例如：若用户通过 Agora SDK 采集数据，自己进行 RTMP 推流，则可以选择该模式。
   * - 1：只写模式，用户替换 AudioFrame 中的数据以供 Agora SDK 编码传输。例如：若用户自行采集数据，可选择该模式。
   * - 2：读写模式，用户从 AudioFrame 获取并修改数据，并返回给 Aogra SDK 进行编码传输。例如：若用户自己有音效处理模块，且想要根据实际需要对数据进行前处理 (例如变声)，则可以选择该模式。
   * @param {number} samplesPerCall 指定返回数据的采样点数，如 RTMP 推流应用中通常为 1024。 SamplesPerCall = (int)(SampleRate × sampleInterval)，其中：sample ≥ 0.01，单位为秒
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the audio recording format.
   * @param {number} sampleRate Sets the sample rate (`samplesPerSec`) returned, which can set be as 8000, 16000, 32000, 44100 or 48000 Hz.
   * @param {number} channel Sets the number of audio channels (`channels`) returned:
   * - 1: Mono
   * - 2: Stereo
   * @param {number} mode Sets the use mode:
   * - 0: Read-only mode: Users only read the AudioFrame data without modifying anything. For example, when users acquire the data with the Agora SDK then push the RTMP streams.
   * - 1: Write-only mode: Users replace the AudioFrame data with their own data and pass the data to the SDK for encoding. For example, when users acquire the data.
   * - 2: Read and write mode: Users read the data from AudioFrame, modify it, and then play it. For example, when users have their own sound-effect processing module and perform some voice pre-processing, such as a voice change.
   * @param {number} samplesPerCall Sets the sample points (`samples`) returned. `samplesPerCall` is usually set as 1024 for stream pushing.
   * samplesPerCall = (int)(samplesPerSec × sampleInterval × numChannels), where sampleInterval ≥ 0.01 in seconds.
  * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setRecordingAudioFrameParameters(
    sampleRate: number,
    channel: 1|2,
    mode: 0|1|2,
    samplesPerCall: number
  ): number {
    return this.rtcEngine.setRecordingAudioFrameParameters(
      sampleRate,
      channel,
      mode,
      samplesPerCall
    );
  }

  /** @zh-cn
   * 设置播放的声音格式。
   * @param {number} 指定返回数据的采样率，可设置为 8000，16000，32000，44100 或 48000
   * @param {number} 指定返回数据的通道数：
   * - 1：单声道
   * - 2：双声道
   * @param {number} mode 指定使用模式：
   * - 0：只读模式，用户仅从 AudioFrame 获取原始音频数据。例如：若用户通过 Agora SDK 采集数据，自己进行 RTMP 推流，则可以选择该模式。
   * - 1：只写模式，用户替换 AudioFrame 中的数据以供 Agora SDK 编码传输。例如：若用户自行采集数据，可选择该模式。
   * - 2：读写模式，用户从 AudioFrame 获取并修改数据，并返回给 Aogra SDK 进行编码传输。例如：若用户自己有音效处理模块，且想要根据实际需要对数据进行前处理 (例如变声)，则可以选择该模式。
   * @param {number} 指定返回数据的采样点数，如 RTMP 推流应用中通常为 1024。 SamplesPerCall = (int)(SampleRate × sampleInterval)，其中：sample ≥ 0.01，单位为秒
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the audio playback format.
   * @param {number} sampleRate Sets the sample rate (`samplesPerSec`) returned, which can be set as 8000, 16000, 32000, 44100, or 48000 Hz.
   * @param {number} channel Sets the number of audio channels (`channels`) returned:
   * - 1: Mono
   * - 2: Stereo
   * @param {number} mode Sets the use mode:
   * - 0: Read-only mode: Users only read the AudioFrame data without modifying anything. For example, when users acquire the data with the Agora SDK then push the RTMP streams.
   * - 1: Write-only mode: Users replace the AudioFrame data with their own data and pass the data to the SDK for encoding. For example, when users acquire the data.
   * - 2: Read and write mode: Users read the data from AudioFrame, modify it, and then play it. For example, when users have their own sound-effect processing module and perform some voice pre-processing, such as a voice change.
   * @param {number} samplesPerCall Sets the sample points (`samples`) returned. `samplesPerCall` is usually set as 1024 for stream pushing.
   * samplesPerCall = (int)(samplesPerSec × sampleInterval × numChannels), where sampleInterval ≥ 0.01 in seconds.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setPlaybackAudioFrameParameters(
    sampleRate: number,
    channel: 1|2,
    mode: 0|1|2,
    samplesPerCall: number
  ): number {
    return this.rtcEngine.setPlaybackAudioFrameParameters(
      sampleRate,
      channel,
      mode,
      samplesPerCall
    );
  }

  /** @zh-cn
   * 设置录制和播放声音混音后的数据格式。
   * @param {number} sampleRate 指定返回数据的采样率，可设置为 8000，16000，32000，44100 或 48000
   * @param {number} samplesPerCall 指定 onMixedAudioFrame 中返回数据的采样点数，如 RTMP 推流应用中通常为 1024。 SamplesPerCall = (int)(SampleRate × sampleInterval)，其中：sample ≥ 0.01，单位为秒
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the mixed audio format.
   * @param {number} sampleRate Sets the sample rate (`samplesPerSec`) returned, which can be set as 8000, 16000, 32000, 44100, or 48000 Hz.
   * @param {number} samplesPerCall Sets the sample points (`samples`) returned. `samplesPerCall` is usually set as 1024 for stream pushing.
   * samplesPerCall = (int)(samplesPerSec × sampleInterval × numChannels), where sampleInterval ≥ 0.01 in seconds.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setMixedAudioFrameParameters(
    sampleRate: number,
    samplesPerCall: number
  ): number {
    return this.rtcEngine.setMixedAudioFrameParameters(sampleRate, samplesPerCall);
  }

  // ===========================================================================
  // DATA CHANNEL
  // ===========================================================================
  /** @zh-cn
   * 创建数据流。
   *
   * 该方法用于创建数据流。频道内每人最多只能创建 5 个数据流。频道内数据通道最多允许数据延迟 5 秒，若超过 5 秒接收方尚未收到数据流，则数据通道会向 App 报错。
   *
   * **Note**：请将 reliable 和 ordered 同时设置为 true 或 false，暂不支持交叉设置。
   * @param {boolean} reliable
   * - true：接收方 5 秒内会收到发送方所发送的数据，否则会收到 streamMessageError 回调并获得相应报错信息
   * - false：接收方不保证收到，就算数据丢失也不会报错
   * @param {boolean} ordered
   * - true：接收方 5 秒内会按照发送方发送的顺序收到数据包
   * - false：接收方不保证按照发送方发送的顺序收到数据包
   * @returns {number}
   * - 创建数据流成功则返回数据流 ID
   * - < 0：创建数据流失败。如果返回的错误码是负数，对应错误代码和警告代码里的正整数
   */
  /**
   * @description Creates a data stream.
   *
   * Each user can have up to five simultaneous data streams in a channel.
   *
   * **Note**:
   * Set both the `reliable` and `ordered` parameters to true or false. Do not set one as true and the other as false.
   * @param {boolean} reliable Sets whether or not the recipients are guaranteed to receive the data stream from the sender within five seconds:
   * - true: The recipients will receive data from the sender within 5 seconds. If the recipient does not receive the sent data within 5 seconds, the data channel will report an error to the application.
   * - false: There is no guarantee that the recipients receive the data stream within five seconds and no error message is reported for any delay or missing data stream.
   * @param {boolean} ordered Sets whether or not the recipients receive the data stream in the sent order:
   * - true: The recipients receive the data stream in the sent order.
   * - false: The recipients do not receive the data stream in the sent order.
   * @returns {number}
   * - Returns the ID of the data stream, if this method call succeeds.
   * - < 0: Failure and returns an error code.
   */
  createDataStream(reliable: boolean, ordered: boolean): number {
    return this.rtcEngine.createDataStream(reliable, ordered);
  }

  /** @zh-cn
   * 发送数据流。
   *
   * 该方法发送数据流消息到频道内所有用户。SDK 对该方法的实现进行了如下限制：频道内每秒最多能发送 30 个包，且每个包最大为 1 KB。 每个客户端每秒最多能发送 6 KB 数据。频道内每人最多能同时有 5 个数据通道。
   *
   * 成功调用该方法后，远端会触发 streamMessage 回调，远端用户可以在该回调中获取接收到的流消息；
   * 若调用失败，远端会触发 streamMessageError 回调。
   * @param {number} streamId 数据流 ID，createDataStream 的返回值
   * @param {string} msg 待发送的数据
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sends data stream messages to all users in a channel.
   *
   * The SDK has the following restrictions on this method:
   * - Up to 30 packets can be sent per second in a channel with each packet having a maximum size of 1 kB.
   * - Each client can send up to 6 kB of data per second.
   * - Each user can have up to five data streams simultaneously.
   *
   * A successful {@link sendStreamMessage} method call triggers the streamMessage callback on the remote client, from which the remote user gets the stream message.
   *
   * A failed {@link sendStreamMessage} method call triggers the streamMessageError callback on the remote client.
   *
   * **Note**:
   * This method applies only to the Communication profile or to the hosts in the Live-broadcast profile.
   * If an audience in the Live-broadcast profile calls this method, the audience may be switched to a host.
   * @param {number} streamId ID of the sent data stream, returned in the {@link createDataStream} method.
   * @param {string} msg Data to be sent.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  sendStreamMessage(streamId: number, msg: string): number {
    return this.rtcEngine.sendStreamMessage(streamId, msg);
  }

  // ===========================================================================
  // MANAGE AUDIO EFFECT
  // ===========================================================================
  /** @zh-cn
   * 获取播放音效文件音量。范围为 [0.0, 100.0]。
   * @returns {number}
   * - 方法调用成功则返回音量值
   * - < 0：方法调用失败
   */
  /**
   * @description Retrieves the volume of the audio effects.
   *
   * The value ranges between 0.0 and 100.0.
   * @returns {number}
   * - ≥ 0: Volume of the audio effects, if this method call succeeds.
   * - < 0: Failure.
   */
  getEffectsVolume(): number {
    return this.rtcEngine.getEffectsVolume();
  }
  /** @zh-cn
   * 设置播放音效文件音量。
   * @param {number} volume 音效文件的音量。取值范围为 [0.0, 100.0]。100.0 为默认值
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the volume of the audio effects.
   * @param {number} volume Sets the volume of the audio effects. The value ranges between 0 and 100 (default).
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setEffectsVolume(volume: number): number {
    return this.rtcEngine.setEffectsVolume(volume);
  }
  /** @zh-cn
   * 设置单个音效文件的音量。
   * @param {number} soundId 指定音效的 ID。每个音效均有唯一的 ID
   * @param {number} volume 音效文件的音量。取值范围为 [0.0, 100.0]。100.0 为默认值
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the volume of a specified audio effect.
   * @param {number} soundId ID of the audio effect. Each audio effect has a unique ID.
   * @param {number} volume Sets the volume of the specified audio effect. The value ranges between 0.0 and 100.0 (default).
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setVolumeOfEffect(soundId: number, volume: number): number {
    return this.rtcEngine.setVolumeOfEffect(soundId, volume);
  }
  /** @zh-cn
   * 播放指定音效文件。
   *
   * 该方法播放指定的本地或在线音效文件。你可以在该方法中设置音效文件的播放次数、音调、音效的空间位置和增益，以及远端用户是否能听到该音效。
   *
   * 你可以多次调用该方法，通过传入不同的音效文件的 soundID 和 filePath，同时播放多个音效文件，实现音效叠加。为获得最佳用户体验，我们建议同时播放的音效文件不要超过 3 个。调用该方法播放音效结束后，SDK 会触发 audioEffectFinished 回调。
   * @param {number} soundId 指定音效的 ID。每个音效均有唯一的 ID
   * @param {string} filePath 指定要播放的音效文件的绝对路径或 URL 地址
   * @param {number} loopcount 设置音效循环播放的次数：
   * - 0：播放音效一次
   * - 1：播放音效两次
   * - -1：无限循环播放音效，直至调用 {@link stopEffect} 或 {@link stopAllEffects} 后停止
   * @param {number} pitch 设置音效的音调，取值范围为 [0.5, 2]。默认值为 1.0，表示不需要修改音调。取值越小，则音调越低
   * @param {number} pan 设置是否改变音效的空间位置。取值范围为 [-1.0, 1.0]：
   * - 0.0：音效出现在正前方
   * - 1.0：音效出现在右边
   * - -1.0：音效出现在左边
   * @param {number} gain 设置是否改变单个音效的音量。取值范围为 [0.0, 100.0]。默认值为 100.0。取值越小，则音效的音量越低
   * @param {boolean} publish 设置是否将音效传到远端：
   * - true：音效在本地播放的同时，会发布到 Agora 云上，因此远端用户也能听到该音效
   * - false：音效不会发布到 Agora 云上，因此只能在本地听到该音效
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Plays a specified local or online audio effect file.
   *
   * This method allows you to set the loop count, pitch, pan, and gain of the audio effect file, as well as whether the remote user can hear the audio effect.
   *
   * To play multiple audio effect files simultaneously, call this method multiple times with different soundIds and filePaths.
   * We recommend playing no more than three audio effect files at the same time.
   *
   * When the audio effect file playback finishes, the SDK returns the audioEffectFinished callback.
   * @param {number} soundId ID of the specified audio effect. Each audio effect has a unique ID.
   * @param {string} filePath The absolute path to the local audio effect file or the URL of the online audio effect file.
   * @param {number} loopcount Sets the number of times the audio effect loops:
   * - 0: Play the audio effect once.
   * - 1: Play the audio effect twice.
   * - -1: Play the audio effect in an indefinite loop until the {@link stopEffect} or {@link stopEffect} method is called.
   * @param {number} pitch Sets the pitch of the audio effect. The value ranges between 0.5 and 2.
   * The default value is 1 (no change to the pitch). The lower the value, the lower the pitch.
   * @param {number} pan Sets the spatial position of the audio effect. The value ranges between -1.0 and 1.0:
   * - 0.0: The audio effect displays ahead.
   * - 1.0: The audio effect displays to the right.
   * - -1.0: The audio effect displays to the left.
   * @param {number} gain Sets the volume of the audio effect. The value ranges between 0.0 and 100.0 (default).
   * The lower the value, the lower the volume of the audio effect.
   * @param {boolean} publish Sets whether or not to publish the specified audio effect to the remote stream:
   * - true: The locally played audio effect is published to the Agora Cloud and the remote users can hear it.
   * - false: The locally played audio effect is not published to the Agora Cloud and the remote users cannot hear it.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  playEffect(
    soundId: number,
    filePath: string,
    loopcount: number,
    pitch: number,
    pan: number,
    gain: number,
    publish: number
  ): number {
    return this.rtcEngine.playEffect(
      soundId,
      filePath,
      loopcount,
      pitch,
      pan,
      gain,
      publish
    );
  }
  /** @zh-cn
   * 停止播放指定音效文件。
   * @param {number} soundId 指定音效的 ID。每个音效均有唯一的 ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Stops playing a specified audio effect.
   * @param {number} soundId ID of the audio effect to stop playing. Each audio effect has a unique ID.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  stopEffect(soundId: number): number {
    return this.rtcEngine.stopEffect(soundId);
  }

  /** @zh-cn
   * 停止播放所有音效文件。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
  /**
   * @description Stops playing all audio effects.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  stopAllEffects(): number {
    return this.rtcEngine.stopAllEffects()
  }
  /** @zh-cn
   * 预加载音效文件。
   *
   * 为保证通信畅通，请注意控制预加载音效文件的大小，并在 {@link joinChannel} 前就使用该方法完成音效预加载。
   * 音效文件支持以下音频格式：mp3，aac，m4a，3gp，wav。
   * @param {number} soundId 指定音效的 ID。每个音效均有唯一的 I
   * @param {string} filePath 音效文件的绝对路径
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Preloads a specified audio effect file into the memory.
   *
   * To ensure smooth communication, limit the size of the audio effect file.
   * We recommend using this method to preload the audio effect before calling the {@link joinChannel} method.
   *
   * Supported audio formats: mp3, aac, m4a, 3gp, and wav.
   *
   * **Note**:
   * This method does not support online audio effect files.
   *
   * @param {number} soundId ID of the audio effect. Each audio effect has a unique ID.
   * @param {string} filePath The absolute path of the audio effect file.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  preloadEffect(soundId: number, filePath: string): number {
    return this.rtcEngine.preloadEffect(soundId, filePath);
  }
  /** @zh-cn
   * 释放音效文件。
   * @param {number} soundId 指定音效的 ID。每个音效均有唯一的 ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Releases a specified preloaded audio effect from the memory.
   * @param {number} soundId ID of the audio effect. Each audio effect has a unique ID.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  unloadEffect(soundId: number): number {
    return this.rtcEngine.unloadEffect(soundId);
  }
  /** @zh-cn
   * 暂停音效文件播放。
   * @param {number} soundId 指定音效的 ID。每个音效均有唯一的 ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Pauses a specified audio effect.
   * @param {number} soundId ID of the audio effect. Each audio effect has a unique ID.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  pauseEffect(soundId: number): number {
    return this.rtcEngine.pauseEffect(soundId);
  }
  /** @zh-cn
   * 暂停所有音效文件播放。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Pauses all the audio effects.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  pauseAllEffects(): number {
    return this.rtcEngine.pauseAllEffects();
  }
  /** @zh-cn
   * 恢复播放指定音效文件。
   * @param {number} soundId 指定音效的 ID。每个音效均有唯一的 ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Resumes playing a specified audio effect.
   * @param {number} soundId sound id
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  resumeEffect(soundId: number): number {
    return this.rtcEngine.resumeEffect(soundId);
  }
  /** @zh-cn
   * 恢复播放所有音效文件。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Resumes playing all audio effects.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  resumeAllEffects(): number {
    return this.rtcEngine.resumeAllEffects();
  }
  /** @zh-cn
   * 开启/关闭远端用户的语音立体声。
   *
   * 如果想调用 {@link setRemoteVoicePosition} 实现听声辨位的功能，请确保在调用 {@link joinChannel} 方法前调用该方法。
   *
   * @param {boolean} enable 是否开启远端用户语音立体声：
   * - true：开启
   * - false：（默认）关闭
   *
   */
  /**
   * @description Enables/Disables stereo panning for remote users.
   *
   * Ensure that you call this method before {@link joinChannel} to enable stereo panning
   * for remote users so that the local user can track the position of a remote user
   * by calling {@link setRemoteVoicePosition}.
   * @param {boolean} enable Sets whether or not to enable stereo panning for remote users:
   * - true: enables stereo panning.
   * - false: disables stereo panning.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  enableSoundPositionIndication(enable: boolean) {
    return this.rtcEngine.enableSoundPositionIndication(enable);
  }

  /** @zh-cn
   * 设置远端用户声音的空间位置和音量，方便本地用户听声辨位。
   *
   * 用户通过调用该接口，设置远端用户声音出现的位置，左右声道的声音差异会让用户产生声音的方位感，从而判断出远端用户的实时位置。
   * 在多人在线游戏场景，如吃鸡游戏中，该方法能有效增加游戏角色的方位感，模拟真实场景。
   *
   * **Note**：
   * - 使用该方法需要在加入频道前调用 {@link enableSoundPositionIndication} 开启远端用户的语音立体声
   * - 为获得最佳听觉体验，我们建议用户佩戴耳机
   * @param {number} uid 远端用户的 ID
   * @param {number} pan 设置远端用户声音出现的位置，取值范围为 [-1.0, 1.0]：
   * - 0.0：（默认）声音出现在正前方
   * - -1.0：声音出现在左边
   * - 1.0：声音出现在右边
   * @param {number} gain 设置远端用户声音的音量，取值范围为 [0.0, 100.0]，默认值为 100.0，表示该用户的原始音量。取值越小，则音量越低
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Sets the sound position and gain of a remote user.
   *
   * When the local user calls this method to set the sound position of a remote user, the sound difference between the left and right channels allows
   * the local user to track the real-time position of the remote user,
   * creating a real sense of space. This method applies to massively multiplayer online games, such as Battle Royale games.
   *
   * **Note**:
   * - For this method to work, enable stereo panning for remote users by calling the {@link enableSoundPositionIndication} method before joining a channel.
   * - This method requires hardware support. For the best sound positioning, we recommend using a stereo speaker.
   * @param {number} uid The ID of the remote user.
   * @param {number} pan The sound position of the remote user. The value ranges from -1.0 to 1.0:
   * - 0.0: The remote sound comes from the front.
   * - -1.0: The remote sound comes from the left.
   * - 1.0: The remote sound comes from the right.
   * @param {number} gain Gain of the remote user. The value ranges from 0.0 to 100.0. The default value is 100.0 (the original gain of the remote user).
   * The smaller the value, the less the gain.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setRemoteVoicePosition(uid: number, pan: number, gain: number): number {
    return this.rtcEngine.setRemoteVoicePosition(uid, pan, gain);
  }


  // ===========================================================================
  // EXTRA
  // ===========================================================================

  /** @zh-cn
   * 获取通话 ID。
   *
   * 获取当前的通话 ID。客户端在每次 {@link joinChannel} 后会生成一个对应的 CallId，标识该客户端的此次通话。
   * 有些方法如 rate, complain 需要在通话结束后调用，向 SDK 提交反馈，这些方法必须指定 CallId 参数。
   * 使用这些反馈方法，需要在通话过程中调用 getCallId 方法获取 CallId，在通话结束后在反馈方法中作为参数传入。
   * @returns {string} 通话 ID
   */
  /**
   * @description Retrieves the current call ID.
   * When a user joins a channel on a client, a `callId` is generated to identify the call from the client.
   * Feedback methods, such as {@link rate} and {@link complain}, must be called after the call ends to submit feedback to the SDK.
   *
   * The {@link rate} and {@link complain} methods require the `callId` parameter retrieved from the {@link getCallId} method during a call.
   * `callId` is passed as an argument into the {@link rate} and {@link complain} methods after the call ends.
   *
   * @returns {string} The current call ID.
   */
  getCallId(): string {
    return this.rtcEngine.getCallId();
  }

  /** @zh-cn
   * 给通话评分。
   * @param {string} callId 通过 getCallId 函数获取的通话 ID
   * @param {number} rating 给通话的评分，最低 1 分，最高 5 分
   * @param {string} desc （非必选项）给通话的描述，可选，长度应小于 800 字节
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Allows a user to rate a call after the call ends.
   * @param {string} callId Pointer to the ID of the call, retrieved from the {@link getCallId} method.
   * @param {number} rating Rating of the call. The value is between 1 (lowest score) and 5 (highest score).
   * @param {string} desc (Optional) Pointer to the description of the rating, with a string length of less than 800 bytes.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  rate(callId: string, rating: number, desc: string): number {
    return this.rtcEngine.rate(callId, rating, desc);
  }

  /** @zh-cn
   * 投诉通话质量。
   * @param {string} callId 通话 getCallId 函数获取的通话 ID
   * @param {string} desc （非必选项）给通话的描述，可选，长度应小于 800 字节
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @description Allows a user to complain about the call quality after a call ends.
   * @param {string} callId Call ID retrieved from the {@link getCallId} method.
   * @param {string} desc (Optional) Pointer to the description of the complaint, with a string length of less than 800 bytes.
   * @returns {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  complain(callId: string, desc: string): number {
    return this.rtcEngine.complain(callId, desc);
  }

  // ===========================================================================
  // replacement for setParameters call
  // ===========================================================================
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  setBool(key: string, value: boolean): number {
    return this.rtcEngine.setBool(key, value);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  setInt(key: string, value: number): number {
    return this.rtcEngine.setInt(key, value);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  setUInt(key: string, value: number): number {
    return this.rtcEngine.setUInt(key, value);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  setNumber(key: string, value: number): number {
    return this.rtcEngine.setNumber(key, value);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  setString(key: string, value: string): number {
    return this.rtcEngine.setString(key, value);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  setObject(key: string, value: string): number {
    return this.rtcEngine.setObject(key, value);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  getBool(key: string): boolean {
    return this.rtcEngine.getBool(key);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  getInt(key: string): number {
    return this.rtcEngine.getInt(key);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  getUInt(key: string): number {
    return this.rtcEngine.getUInt(key);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  getNumber(key: string): number {
    return this.rtcEngine.getNumber(key);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  getString(key: string): string {
    return this.rtcEngine.getString(key);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  getObject(key: string): string {
    return this.rtcEngine.getObject(key);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  getArray(key: string): string {
    return this.rtcEngine.getArray(key);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  setParameters(param: string): number {
    return this.rtcEngine.setParameters(param);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  convertPath(path: string): string {
    return this.rtcEngine.convertPath(path);
  }
  /** @zh-cn
   * 该方法为私有接口。
   */
  /** @description Private Interfaces. */
  setProfile(profile: string, merge: boolean): number {
    return this.rtcEngine.setProfile(profile, merge);
  }
}
/** The AgoraRtcEngine interface. */
declare interface AgoraRtcEngine {
  /** @zh-cn
   * API 方法已执行回调。包含如下参数：
   * - api：已执行的 API 方法
   * - err：执行 API 过程中的错误
   */
  /**
   * Occurs when an API method is executed.
   * - api: The method executed by the SDK.
   * - err: Error code that the SDK returns when the method call fails.
   */
  on(evt: 'apiCallExecuted', cb: (api: string, err: number) => void): this;
  /** @zh-cn
   * 发生警告回调。包含如下参数：
   * - warn：警告码
   * - msg：详细的警告信息
   */
  /**
   * Reports a warning during SDK runtime.
   * - warn: Warning code.
   * - msg: Pointer to the warning message.
   */
  on(evt: 'warning', cb: (warn: number, msg: string) => void): this;
  /** @zh-cn
   * 发生错误警告。包含如下参数：
   * - err：错误码
   * - msg：详细的错误信息
   */
  /** Reports an error during SDK runtime.
   * - err: Error code.
   * - msg: Pointer to the error message.
   */
  on(evt: 'error', cb: (err: number, msg: string) => void): this;
  /** @zh-cn
   * 成功加入频道。包含如下参数：
   * - channel：频道名
   * - uid：用户 ID
   * - elapsed：从调用 {@link joinChannel} 开始到发生此事件过去的时间（毫秒)
   */
  /** Occurs when a user joins a specified channel.
   * - channel: Pointer to the channel name.
   * - uid: User ID of the user joining the channel.
   * - elapsed: Time elapsed (ms) from the user calling the {@link joinChannel} method until the SDK triggers this callback.
   */
  on(evt: 'joinedChannel', cb: (
    channel: string, uid: number, elapsed: number
  ) => void): this;
  /** @zh-cn
   * 重新加入频道回调。
   * 有时候由于网络原因，客户端可能会和服务器失去连接，SDK 会进行自动重连，自动重连成功后触发此回调方法。
   * 包含如下参数：
   * - channel：频道名
   * - uid：用户 ID
   * - elapsed：从调用 {@link joinChannel} 开始到发生此事件过去的时间（毫秒)
   */
  /** Occurs when a user rejoins the channel after disconnection due to network problems.
   * When a user loses connection with the server because of network problems, the SDK automatically tries to reconnect and triggers this callback upon reconnection.
   * - channel: Pointer to the channel name.
   * - uid: User ID of the user joining the channel.
   * - elapsed: Time elapsed (ms) from the user calling the {@link joinChannel} method until the SDK triggers this callback.
   */
  on(evt: 'rejoinedChannel', cb: (
    channel: string, uid: number, elapsed: number
  ) => void): this;
  // on(evt: 'audioQuality', cb: (
  //   uid: number, quality: AgoraNetworkQuality, delay: number, lost: number
  // ) => void): this;
  /** @zh-cn
   * 提示频道内谁在说话以及说话者音量的回调。
   */
  /** Reports which users are speaking and the speakers' volume. */
  on(evt: 'audioVolumeIndication', cb: (
    uid: number,
    volume: number,
    speakerNumber: number,
    totalVolume: number
  ) => void): this;
  /** @zh-cn
   * 提示频道内谁在说话以及说话者音量的回调。包含如下参数：
   * - speakers：说话者信息的数组，包含：
   *   - uid：用户 ID
   *   - volume：用户的说话音量
   * - speakerNumber：频道内说话者的人数
   * - volume：（混音后的）总音量，范围为 [0, 255]
   *
   */
  /** Reports which users are speaking and the speakers' volume.
   * - speakers: A struct containing each speaker's user ID and volume information.
   *  - uid: User ID of the speaker. The uid of the local user is 0.
   *  - volume: The volume of the speaker.
   * - speakerNumber: Total number of speakers.
   * - volume: Total volume after audio mixing. The value ranges between 0 (lowest volume) and 255 (highest volume).
   */
  on(evt: 'groupAudioVolumeIndication', cb: (
    speakers: {
      uid: number,
      volume: number
    }[],
    speakerNumber: number,
    totalVolume: number
  ) => void): this;
  /** @zh-cn
   * 离开频道回调。
   * App 调用 {@link leaveChannel} 方法成功离开频道后，SDK 会触发该回调。
   */
  /** Occurs when the user leaves the channel. When the app calls the {@link leaveChannel} method, the SDK uses
   * this callback to notify the app when the user leaves the channel.
   */
  on(evt: 'leaveChannel', cb: () => void): this;
  /** @zh-cn
   * 通话相关统计信息。包含如下参数：
   * - stats：通话信息详情 {@link RtcStats}
   */
  /** Reports the statistics of the AgoraRtcEngine once every two seconds.
   * - stats: Agora RTC engine statistics, see {@link RtcStats}.
   */
  on(evt: 'rtcStats', cb: (stats: RtcStats) => void): this;
  /** @zh-cn
   * 通话中本地视频流的统计信息回调。包含如下参数：
   * - stats：本地视频流统计信息 {@link LocalVideoStats}
   */
  /** Reports the statistics of the local video streams.
   * - stats: The statistics of the local video stream. See {@link LocalVideoStats}.
   */
  on(evt: 'localVideoStats', cb: (stats: LocalVideoStats) => void): this;
  /** @zh-cn
   * 通话中远端视频流的统计信息回调。包含如下参数：
   * - stats：远端视频流统计信息 {@link RemoteVideoState}
   */
  /** Reports the statistics of the video stream from each remote user/host.
   * - stats: Statistics of the received remote video streams. See {@link RemoteVideoState}.
   */
  on(evt: 'remoteVideoStats', cb: (stats: RemoteVideoStats) => void): this;
  /** @zh-cn
   * 通话中远端音频流的统计信息回调。包含如下参数：
   * - stats：远端音频流统计信息 {@link RemoteAudioStats}
   */
  /** Reports the statistics of the audio stream from each remote user/host.
   * - stats: Statistics of the received remote audio streams. See {@link RemoteAudioStats}.
   */
  on(evt: 'remoteAudioStats', cb: (stats: RemoteAudioStats) => void): this;
  /** @zh-cn
   * 通话中远端视频流传输的统计信息回调。包含如下参数：
   * - stats：远端视频流传输的统计信息 {RemoteVideoTransportStats}
   *
   * 该回调描述远端用户通话中端到端的网络统计信息，通过视频包计算，用客观的数据，如丢包、网络延迟等 ，展示当前网络状态。
   *
   * 通话中，当用户收到远端用户/主播发送的视频数据包后，会每 2 秒触发一次该回调。和 remoteVideoStats 回调相比，该回调以数据展示当前网络状态，因此更客观。
   */
  /** Reports the transport-layer statistics of each remote video stream.
   * This callback reports the transport-layer statistics, such as the packet loss rate and time delay, once every two seconds
   * after the local user receives the video packet from a remote user.
   * - stats: The transport-layer statistics. See {@link RemoteVideoTransportStats}.
   */
  on(evt: 'remoteVideoTransportStats', cb: (stats: RemoteVideoTransportStats) => void): this;
  /** @zh-cn
   * 通话中远端音频流传输的统计信息回调。包含如下参数：
   * - stats：远端音频流传输的统计信息 {@link remoteAudioTransportStats}
   */
  /** Reports the transport-layer statistics of each remote audio stream.
   * - stats: The transport-layer statistics. See {@link remoteAudioTransportStats}.
  */
  on(evt: 'remoteAudioTransportStats', cb: (stats: RemoteAudioTransportStats) => void): this;
  /** @zh-cn
   * 音频设备状态已改变回调。包含如下参数：
   * - deviceId：设备 ID
   * - deviceType：设备类型，详见 {@link MediaDeviceType}
   * - deviceState：设备状态
   *   - 1：设备正在使用
   *   - 2：设备被禁用
   *   - 4：没有此设备
   *   - 8：设备被拔出
   */
  /** Occurs when the audio device state changes.
   * - deviceId: Pointer to the device ID.
   * - deviceType: Device type. See {@link MediaDeviceType}.
   * - deviceState: Device state：
   *
   *  - 1: The device is active
   *  - 2: The device is disabled.
   *  - 4: The device is not present.
   *  - 8: The device is unplugged.
   */
  on(evt: 'audioDeviceStateChanged', cb: (
    deviceId: string,
    deviceType: number,
    deviceState: number,
  ) => void): this;
  // on(evt: 'audioMixingFinished', cb: () => void): this;
  /** @zh-cn
   * 本地用户的音乐文件播放状态改变。包含如下参数：
   * - state：状态码
   *   - 710：音乐文件正常播放
   *   - 711：音乐文件暂停播放
   *   - 713：音乐文件停止播放
   *   - 714：音乐文件报错。SDK 会在 err 参数中返回具体的报错原因
   *
   * - err：错误码：
   *   - 701：音乐文件打开出错
   *   - 702：音乐文件打开太频繁
   *   - 703：音乐文件播放异常中断
   */
  /** Occurs when the state of the local user's audio mixing file changes.
   * - state: The state code.
   *  - 710: The audio mixing file is playing.
   *  - 711: The audio mixing file pauses playing.
   *  - 713: The audio mixing file stops playing.
   *  - 714: An exception occurs when playing the audio mixing file.
   *
   * - err: The error code.
   *  - 701: The SDK cannot open the audio mixing file.
   *  - 702: The SDK opens the audio mixing file too frequently.
   *  - 703: The audio mixing file playback is interrupted.
   *
   */
  on(evt: 'audioMixingStateChanged', cb: (state: number, err: number) => void): this;
  /** @zh-cn
   * 远端音乐文件播放已开始回调。
   * 当远端有用户调用 {@link startAudioMixing} 播放本地音乐文件，会触发该回调。
   */
  /** Occurs when a remote user starts audio mixing.
   * When a remote user calls {@link startAudioMixing} to play the background music, the SDK reports this callback.
   */
  on(evt: 'remoteAudioMixingBegin', cb: () => void): this;
  /** @zh-cn
   * 远端音乐文件播放已结束回调。
   */
  /** Occurs when a remote user finishes audio mixing. */
  on(evt: 'remoteAudioMixingEnd', cb: () => void): this;
  /** @zh-cn
   * 本地音效文件播放已结束回调。
   */
  /** Occurs when the local audio effect playback finishes. */
  on(evt: 'audioEffectFinished', cb: (soundId: number) => void): this;
  /** @zh-cn
   * 视频设备变化回调。包含如下参数：
   * - deviceId：设备 ID
   * - deviceType：设备类型，详见 {@link MediaDeviceType}
   * - deviceState：设备状态
   *   - 1：设备正在使用
   *   - 2：设备被禁用
   *   - 4：没有此设备
   *   - 8：设备被拔出
   *
   * 该回调提示系统视频设备状态发生改变，比如被拔出或移除。如果设备已使用外接摄像头采集，外接摄像头被拔开后，视频会中断。
   */
  /** Occurs when the video device state changes.
   * - deviceId: Pointer to the device ID.
   * - deviceType: Device type. See {@link MediaDeviceType}.
   * - deviceState: Device state：
   *
   *  - 1: The device is active.
   *  - 2: The device is disabled.
   *  - 4: The device is not present.
   *  - 8: The device is unplugged.
   */
  on(evt: 'videoDeviceStateChanged', cb: (
    deviceId: string,
    deviceType: number,
    deviceState: number,
  ) => void): this;
  /** @zh-cn
   * 通话中每个用户的网络上下行 last mile 质量报告回调。
   * 其中 last mile 是指设备到 Agora 边缘服务器的网络状态。包含如下参数：
   * - uid：用户 ID。表示该回调报告的是持有该 ID 的用户的网络质量。当 uid 为 0 时，返回的是本地用户的网络质量
   * - txquality：该用户的上行网络质量，基于上行视频的发送码率、上行丢包率、平均往返时延和网络抖动计算。详见 {@link AgoraNetworkQuality}
   * - rxquality：该用户的下行网络质量，基于下行网络的丢包率、平均往返延时和网络抖动计算。详见 {@link AgoraNetworkQuality}
   */
  /**
   * Reports the last mile network quality of each user in the channel once every two seconds.
   * Last mile refers to the connection between the local device and Agora's edge server.
   *
   * - uid: User ID. The network quality of the user with this uid is reported. If uid is 0,
   * the local network quality is reported.
   * - txquality: Uplink transmission quality rating of the user in terms of the transmission bitrate, packet loss rate,
   * average RTT (Round-Trip Time), and jitter of the uplink network. See {@link AgoraNetworkQuality}.
   * - rxquality: Downlink network quality rating of the user in terms of the packet loss rate, average RTT, and jitter
   * of the downlink network. See {@link AgoraNetworkQuality}.
   */
  on(evt: 'networkQuality', cb: (
    uid: number,
    txquality: AgoraNetworkQuality,
    rxquality: AgoraNetworkQuality
  ) => void): this;
  /** @zh-cn
   * 通话前网络上下行 last mile 质量报告回调。包含如下参数：
   * - quality：网络上下行质量，基于上下行网络的丢包率和抖动计算，探测结果主要反映上行网络的状态。详见 {@link AgoraNetworkQuality}
   *
   * 该回调描述本地用户在加入频道前的 last mile 网络探测的结果，其中 last mile 是指设备到 Agora 边缘服务器的网络状态。
   *
   * 在调用 {@link enableLastmileTest} 之后，该回调函数每 2 秒触发一次。如果远端有多个用户/主播，该回调每 2 秒会被触发多次。
   */
  /** Reports the last mile network quality of the local user once every two seconds before the user joins the channel.
   * - quality: The last mile network quality. See {@link AgoraNetworkQuality}.
   *
   * Last mile refers to the connection between the local device and Agora's edge server. After the application calls the {@link enableLastmileTest} method,
   * this callback reports once every two seconds the uplink and downlink last mile network conditions of the local user before the user joins the channel.
   */
  on(evt: 'lastMileQuality', cb: (quality: AgoraNetworkQuality) => void): this;
  /** @zh-cn
   * 通话前网络质量探测报告回调。包含如下参数：
   * - result：上下行 Last mile 质量探测结果。详见 {@link LastmileProbeResult}
   *
   * 话前网络上下行 Last mile 质量探测报告回调。在调用 {@link startLastmileProbeTest} 之后，SDK 会在约 30 秒内返回该回调。
   */
  /** Reports the last-mile network probe result.
   * - result: The uplink and downlink last-mile network probe test result. See {@link LastmileProbeResult}.
   *
   * The SDK triggers this callback within 30 seconds after the app calls the {@link startLastmileProbeTest} method.
   */
  on(evt: 'lastmileProbeResult', cb: (result: LastmileProbeResult) => void): this;
  /** @zh-cn
   * 已发送本地视频首帧回调。包含如下参数：
   * - width：视频流宽（像素）
   * - height：视频流高（像素）
   * - elapsed：从本地调用 {@link joinChannel} 到发生此事件过去的时间（毫秒)
   */
  /** Occurs when the engine receives and renders the first local video frame on the video window.
   * - width: Width (pixels) of the first local video frame.
   * - height: Height (pixels) of the first local video frame.
   * - elapsed: Time elapsed (ms) from the local user calling the {@link joinChannel} method until the SDK triggers this callback.
   */
  on(evt: 'firstLocalVideoFrame', cb: (
    width: number,
    height: number,
    elapsed: number
  ) => void): this;
  /** @zh-cn
   * 已接收到远端视频并完成解码回调。包含如下参数：
   * - uid：用户 ID，指定是哪个用户的视频流
   * - elapsed：从本地调用 {@link joinChannel} 到发生此事件过去的时间（毫秒)
   *
   * 引擎收到第一帧远端视频流并解码成功时，触发此调用。有两种情况：
   * - 远端用户首次上线后发送视频
   * - 远端用户视频离线再上线后发送视频。出现这种中断的可能原因包括：
   *   - 远端用户离开频道
   *   - 远端用户掉线
   *   - 远端用户调用 {@link muteLocalVideoStream} 方法停止发送本地视频流
   *   - 远端用户调用 {@link disableVideo} 方法关闭视频模块
   */
  /** Occurs when the first remote video frame is received and decoded.
   * - uid: User ID of the remote user sending the video stream.
   * - elapsed: Time elapsed (ms) from the local user calling the {@link joinChannel} method until the SDK triggers this callback.
   * This callback is triggered in either of the following scenarios:
   * - The remote user joins the channel and sends the video stream.
   * - The remote user stops sending the video stream and re-sends it after 15 seconds. Reasons for such an interruption include:
   *  - The remote user leaves the channel.
   *  - The remote user drops offline.
   *  - The remote user calls the {@link muteLocalVideoStream} method to stop sending the video stream.
   *  - The remote user calls the {@link disableVideo} method to disable video.
   */
  on(evt: 'addStream', cb: (
    uid: number,
    elapsed: number,
  ) => void): this;
  /** @zh-cn
   * 本地或远端视频大小和旋转信息发生改变回调。包含如下参数：
   * - uid：图像尺寸和旋转信息发生变化的用户的用户 ID（本地用户的 uid 为 0）
   * - width：视频流的宽度（像素）
   * - height：视频流的高度（像素）
   * - rotation：旋转信息 [0, 360]
   */
  /** Occurs when the video size or rotation of a specified user changes.
   * - uid: User ID of the remote user or local user (0) whose video size or rotation changes.
   * - width: New width (pixels) of the video.
   * - height: New height (pixels) of the video.
   * - roation: New height (pixels) of the video.
   */
  on(evt: 'videoSizeChanged', cb: (
    uid: number,
    width: number,
    height: number,
    rotation: number
  ) => void): this;
  /** @zh-cn
   * 已显示首帧远端视频回调。
   * 第一帧远端视频显示在视图上时，触发此调用。包含如下参数：
   * - uid：用户 ID，指定是哪个用户的视频流
   * - width：视频流宽（像素）
   * - height：视频流高（像素）
   * - elapsed：从本地调用 {@link joinChannel} 到发生此事件过去的时间（毫秒)
   */
  /** Occurs when the first remote video frame is rendered.
   * The SDK triggers this callback when the first frame of the remote video is displayed in the user's video window.
   * - uid: User ID of the remote user sending the video stream.
   * - width: Width (pixels) of the video frame.
   * - height: Height (pixels) of the video stream.
   * - elapsed: Time elapsed (ms) from the local user calling the {@link joinChannel} method until the SDK triggers this callback.
   */
  on(evt: 'firstRemoteVideoFrame', cb: (
    uid: number,
    width: number,
    height: number,
    elapsed: number
  ) => void): this;
  /** @zh-cn
   * 远端用户加入当前频道回调。包含如下参数：
   * - uid：新加入频道的远端用户/主播 ID
   * - elapsed：从本地调用 {@link joinChannel} 到发生此事件过去的时间（毫秒)
   *
   * 该回调在如下情况下会被触发：
   * - 远端用户/主播调用 {@link joinChannel} 方法加入频道
   * - 远端用户加入频道后调用 {@link setClientRole} 将用户角色改变为主播
   * - 远端用户/主播网络中断后重新加入频道
   * - 主播通过调用 {@link addInjectStreamUrl} 方法成功导入在线媒体流
   *
   * **Note**：直播场景下，
   * - 主播间能相互收到新主播加入频道的回调，并能获得该主播的 uid
   * - 观众也能收到新主播加入频道的回调，并能获得该主播的 uid
   * - 当 Web 端加入直播频道时，只要 Web 端有推流，SDK 会默认该 Web 端为主播，并触发该回调。
   */
  /** Occurs when a user or host joins the channel.
   * - uid: User ID of the user or host joining the channel.
   * - elapsed: Time delay (ms) from the local user calling the {@link joinChannel} method until the SDK triggers this callback.
   *
   * The SDK triggers this callback under one of the following circumstances:
   * - A remote user/host joins the channel by calling the {@link joinChannel} method.
   * - A remote user switches the user role to the host by calling the {@link setClientRole} method after joining the channel.
   * - A remote user/host rejoins the channel after a network interruption.
   * - The host injects an online media stream into the channel by calling the {@link addInjectStreamUrl} method.
   *
   * **Note**: In the Live-broadcast profile:
   * - The host receives this callback when another host joins the channel.
   * - The audience in the channel receives this callback when a new host joins the channel.
   * - When a web application joins the channel, the SDK triggers this callback as long as the web application publishes streams.
   */
  on(evt: 'userJoined', cb: (uid: number, elapsed: number) => void): this;
  /** @zh-cn
   * 远端用户离开当前频道回调。包含如下参数：
   * - uid 离线用户或主播的用户 ID。
   * - reason 离线原因：
   *   - 0：用户主动离开。
   *   - 1：因过长时间收不到对方数据包，超时掉线。注意：由于 SDK 使用的是不可靠通道，也有可能对方主动离开本方没收到对方离开消息而误判为超时掉线。
   *   - 2：用户身份从主播切换为观众。
   *
   * 用户离开频道有两个原因：
   * - 正常离开的时候，远端用户/主播会发送类似“再见”的消息。接收此消息后，判断用户离开频道。
   * - 超时掉线的依据是，在一定时间内（通信场景为 20 秒，直播场景稍有延时），用户没有收到对方的任何数据包，则判定为对方掉线。
   在网络较差的情况下，有可能会误报。声网建议使用信令系统来做可靠的掉线检测。
   */
  /** Occurs when a remote user leaves the channel.
   * - uid: User ID of the user leaving the channel or going offline.
   * - reason: Reason why the user is offline:
   *  - 0: The user quits the call.
   *  - 1: The SDK times out and the user drops offline because no data packet is received within a certain period of time.
   *  If the user quits the call and the message is not passed to the SDK (due to an unreliable channel), the SDK assumes the user dropped offline.
   *  - 2: The client role switched from the host to the audience.
   * Reasons why the user is offline:
   * - Leave the channel: When the user leaves the channel, the user sends a goodbye message. When the message is received, the SDK assumes that the user leaves the channel.
   * - Drop offline: When no data packet of the user or host is received for a certain period of time (20 seconds for the Communication profile,
   * and more for the Live-broadcast profile), the SDK assumes that the user drops offline. Unreliable network connections may lead to false detections, so we recommend using a signaling system for more reliable offline detection.
  */
  on(evt: 'removeStream', cb: (uid: number, reason: number) => void): this;
  /** @zh-cn
   * 远端用户暂停/重新发送音频流回调。该回调是由远端用户调用 {@link muteLocalAudioStream} 方法关闭或开启音频发送触发的。
   * 包含如下参数：
   * - uid：用户 ID
   * - muted：该用户是否关闭发送音频流：
   *   - true：该用户已关闭发送音频流
   *   - false：该用户已重新发送音频流
   *
   * **Note**：当频道内的用户或主播人数超过 20 时，该回调不生效。
   */
  /** Occurs when a remote user's audio stream is muted/unmuted.
   *
   * The SDK triggers this callback when the remote user stops or resumes sending the audio stream by calling the {@link muteLocalAudioStream} method.
   * - uid: User ID of the remote user.
   * - muted: Whether the remote user's audio stream is muted/unmuted:
   *  - true: Muted.
   *  - false: Unmuted.
   */
  on(evt: 'userMuteAudio', cb: (uid: number, muted: boolean) => void): this;
  /** @zh-cn
   * 远端用户暂停/重新发送视频流回调。该回调是由远端用户调用 {@link muteLocalVideoStream} 方法关闭或开启音频发送触发的。
   * 包含如下参数：
   * - uid：用户 ID
   * - muted：该用户是否关闭发送视频流：
   *   - true：该用户已关闭发送视频流
   *   - false：该用户已重新发送视频流
   *
   * **Note**：当频道内的用户或主播人数超过 20 时，该回调不生效。
   */
  /** Occurs when a remote user's video stream playback pauses/resumes.
   *
   *
   * The SDK triggers this callback when the remote user stops or resumes sending the video stream by calling the {@link muteLocalVideoStream} method.
   *
   * - uid: User ID of the remote user.
   * - muted: Whether the remote user's video stream playback is paused/resumed:
   *  - true: Paused.
   *  - false: Resumed.
   *
   * **Note**: This callback returns invalid when the number of users in a channel exceeds 20.
   */
  on(evt: 'userMuteVideo', cb: (uid: number, muted: boolean) => void): this;
  /** @zh-cn
   * 其他用户开启/关闭视频模块回调。该回调是由远端用户调用 {@link enableVideo} 或 {@link disableVideo} 方法开启或关闭视频模块触发的。
   * 包含如下参数：
   * - uid：用户 ID
   * - muted：该用户是否开启或关闭视频模块：
   *   - true：该用户已启用视频模块。启用后，该用户可以进行视频通话或直播。
   *   - false：该用户已关闭视频模块。关闭后，该用户只能进行语音通话或直播，不能显示、发送自己的视频，也不能接收、显示别人的视频。
   */
  /** Occurs when a specific remote user enables/disables the video module.
   *
   * The SDK triggers this callback when the remote user enables or disables the video module by calling the {@link enableVideo} or {@link disableVideo} method.
   * - uid: User ID of the remote user.
   * - enabled: Whether the remote user enables/disables the video module:
   *  - true: Enable. The remote user can enter a video session.
   *  - false: Disable. The remote user can only enter a voice session, and cannot send or receive any video stream.
   */
  on(evt: 'userEnableVideo', cb: (uid: number, enabled: boolean) => void): this;
  /** @zh-cn
   * 远端用户开启/关闭本地视频采集。该回调是由远端用户调用 {@link enableLocalVideo} 方法开启或关闭视频采集触发的。
   * 包含如下参数：
   * - uid：用户 ID
   * - enabled：该用户是否开启或关闭本地视频采集：
   *   - true：该用户已启用本地视频采集。启用后，其他用户可以接收到该用户的视频流。
   *   - false：该用户已关闭视频采集。关闭后，该用户仍然可以接收其他用户的视频流，但其他用户接收不到该用户的视频流。
   */
  /** Occurs when a specified remote user enables/disables the local video capturing function.
   *
   * The SDK triggers this callback when the remote user resumes or stops capturing the video stream by calling the {@link enableLocalVideo} method.
   * - uid: User ID of the remote user.
   * - enabled: Whether the remote user enables/disables the local video capturing function:
   *  - true: Enable. Other users in the channel can see the video of this remote user.
   *  - false: Disable. Other users in the channel can no longer receive the video stream from this remote user, while this remote user can still receive the video streams from other users.
   */
  on(evt: 'userEnableLocalVideo', cb: (uid: number, enabled: boolean) => void): this;
  /** @zh-cn
   * @deprecated 该回调已废弃。请改用 localVideoStateChanged。
   * 摄像头就绪回调。
   */
   /**
    * @deprecated Replaced by the localVideoStateChanged callback.
    * Occurs when the camera turns on and is ready to capture the video.
    */
  on(evt: 'cameraReady', cb: () => void): this;
  /** @zh-cn
   * @deprecated 该回调已废弃。请改用 localVideoStateChanged。
   * 视频功能停止回调。
   */
  /**
   * @deprecated Replaced by the localVideoStateChanged callback.
   * Occurs when the video stops playing.
   */
  on(evt: 'videoStopped', cb: () => void): this;
  /** @zh-cn
   * 网络连接中断，且 SDK 无法在 10 秒内连接服务器回调。
   * SDK 在调用 {@link joinChannel} 后，无论是否加入成功，只要 10 秒和服务器无法连接就会触发该回调。
   */
  /** Occurs when the SDK cannot reconnect to Agora's edge server 10 seconds after its connection to the server is interrupted.
   * The SDK triggers this callback when it cannot connect to the server 10 seconds after calling the {@link joinChannel} method, whether or not it is in the channel.
   */
  on(evt: 'connectionLost', cb: () => void): this;
  // on(evt: 'connectionInterrupted', cb: () => void): this;
  /** @zh-cn
   * 网络连接已被服务器禁止回调。
   * @deprecated 该回调已废弃。请改用 connectionStateChanged 回调。
   * 当你被服务端禁掉连接的权限时，会触发该回调。
   */
  /**
   * @deprecated Replaced by the connectionStateChanged callback.
   * Occurs when your connection is banned by the Agora Server.
   */
  on(evt: 'connectionBanned', cb: () => void): this;
  // on(evt: 'refreshRecordingServiceStatus', cb: () => void): this;
  /** @zh-cn
   * 接收到对方数据流消息的回调。该回调表示本地用户收到了远端用户调用 {@link sendStreamMessage} 方法发送的流消息。
   * 包含如下参数：
   * - uid：用户 ID
   * - streamId：数据流 ID
   * - msg：接收到的流消息
   * - len：流消息数据长度
   */
  /** Occurs when the local user receives the data stream from the remote user within five seconds.
   *
   * The SDK triggers this callback when the local user receives the stream message that the remote user sends by calling the {@link sendStreamMessage} method.
   * - uid: User ID of the remote user sending the message.
   * - streamId: Stream ID.
   * - msg: Pointer to the data received bt the local user.
   * - len: Length of the data in bytes.
   */
  on(evt: 'streamMessage', cb: (
    uid: number,
    streamId: number,
    msg: string,
    len: number
  ) => void): this;
  /** @zh-cn
   * 接收对方数据流小时发生错误回调。该回调表示本地用户未收到远端用户调用 {@link sendStreamMessage} 方法发送的流消息。
   * 包含如下参数：
   * - uid：用户 ID
   * - streamId：数据流 ID
   * - err：错误代码
   * - missed：丢失的消息数量
   * - cached：数据流中断后，后面缓存的消息数量
   */
  /** Occurs when the local user does not receive the data stream from the remote user within five seconds.
   * The SDK triggers this callback when the local user fails to receive the stream message that the remote user sends by calling the {@link sendStreamMessage} method.
   * - uid: User ID of the remote user sending the message.
   * - streamId: Stream ID.
   * - err: Error code.
   * - missed: Number of the lost messages.
   * - cached: Number of incoming cached messages when the data stream is interrupted.
   */
  on(evt: 'streamMessageError', cb: (
    uid: number,
    streamId: number,
    code: number,
    missed: number,
    cached: number
  ) => void): this;
  /** @zh-cn
   * 媒体引擎成功启动的回调。
   */
  /** Occurs when the media engine call starts. */
  on(evt: 'mediaEngineStartCallSuccess', cb: () => void): this;
  /** @zh-cn
   * Token 已过期回调。
   * 在调用 {@link joinChannel} 时如果指定了 Token，由于 Token 具有一定的时效，在通话过程中 SDK 可能由于网络原因和服务器失去连接，
   重连时可能需要新的 Token。该回调通知 App 需要生成新的 Token，并需调用 {@link renewToken} 为 SDK 指定新的 Token。
   */
  /** Occurs when the token expires.
   * After a token is specified by calling the {@link joinChannel} method, if the SDK losses connection with the Agora server due to network issues, the token may expire after a certain period
   * of time and a new token may be required to reconnect to the server.
   *
   * This callback notifies the application to generate a new token. Call the {@link renewToken} method to renew the token
   */
  on(evt: 'requestChannelKey', cb: () => void): this;
  /** @zh-cn
   * 已发送本地音频首帧回调。包含如下参数：
   * - elapsed：从本地用户调用 {@link joinChannel} 方法直至该回调被触发的延迟（毫秒）
   */
  /** Occurs when the engine sends the first local audio frame.
   * - elapsed: Time elapsed (ms) from the local user calling {@link joinChannel} until the
   * SDK triggers this callback.
   */
  on(evt: 'fristLocalAudioFrame', cb: (elapsed: number) => void): this;
  /** @zh-cn
   * 已接收远端音频首帧回调。包含如下参数：
   * - uid：发送音频帧的远端用户的 ID
   * - elapsed：从调用 {@link joinChannel} 方法直至该回调被触发的延迟（毫秒）
   */
  /** Occurs when the engine receives the first audio frame from a specific remote user.
   * - uid: User ID of the remote user.
   * - elapsed: Time elapsed (ms) from the local user calling {@link joinChannel} until the
   * SDK triggers this callback.
   */
  on(evt: 'firstRemoteAudioFrame', cb: (uid: number, elapsed: number) => void): this;
  /**
   * Occurs when the engine receives the first audio frame from a specified remote user.
   * - uid: User ID of the remote user sending the audio stream.
   * - elapsed: The time elapsed (ms) from the local user calling the {@link joinChannel} method until the SDK triggers this callback.
   */
  on(evt: 'firstRemoteAudioDecoded', cb: (uid: number, elapsed: number) => void): this;
  /** @zh-cn
   * 检测到活跃用户回调。包含如下参数：
   * - uid：当前时间段声音最大的用户的 uid。如果返回的 uid 为 0，则默认为本地用户
   *
   * 如果用户开启了 {@link enableAudioVolumeIndication} 功能，则当音量检测模块监测到频道内有新的活跃用户说话时，会通过本回调返回该用户的 uid。
   *
   * **Note**：
   * - 你需要开启 {@link enableAudioVolumeIndication} 方法才能收到该回调。
   * - uid 返回的是当前时间段内声音最大的用户 ID，而不是瞬时声音最大的用户 ID。
   */
  /**
   * Reports which user is the loudest speaker.
   * - uid: User ID of the active speaker. A uid of 0 represents the local user.
   * If the user enables the audio volume indication by calling the {@link enableAudioVolumeIndication} method, this callback returns the uid of the
   * active speaker detected by the audio volume detection module of the SDK.
   *
   * **Note**:
   * - To receive this callback, you need to call the {@link enableAudioVolumeIndication} method.
   * - This callback returns the user ID of the user with the highest voice volume during a period of time, instead of at the moment.
   */
  on(evt: 'activeSpeaker', cb: (uid: number) => void): this;
  /** @zh-cn
   * 用户角色已切换回调。该回调由本地用户在加入频道后调用 {@link setClientRole} 改变用户角色触发的。
   * 包含如下参数：
   * - oldRole：切换前的角色
   * - newRole：切换后的角色
   */
  /** Occurs when the user role switches in a live broadcast. For example, from a host to an audience or vice versa.
   *
   * This callback notifies the application of a user role switch when the application calls the {@link setClientRole} method.
   *
   * - oldRole: Role that the user switches from ClientRoleType.
   * - newRole: Role that the user switches to ClientRoleType.
   */
  on(evt: 'clientRoleChanged', cb: (
    oldRole: ClientRoleType,
    newRole: ClientRoleType
  ) => void): this;
  /** @zh-cn
   * 回放、录音设备、或 App 的音量发生改变。包含如下参数：
   * - deviceType：设备类型，详见 {@link MediaDeviceType}
   * - volume：当前音量，取值范围为 [0, 255]
   * - muted：音频设备是否为静音状态
   *   - true：音频设备已静音
   *   - false：音频设备未被静音
   */
  /** Occurs when the volume of the playback device, microphone, or application changes.
   * - deviceType: Device type. See {@link MediaDeviceType}.
   * - volume: Volume of the device. The value ranges between 0 and 255.
   * - muted:
   *  - true: Volume of the device. The value ranges between 0 and 255.
   *  - false: The audio device is not muted.
   */
  on(evt: 'audioDeviceVolumeChanged', cb: (
    deviceType: MediaDeviceType,
    volume: number,
    muted: boolean
  ) => void): this;
  /** @zh-cn
   * 屏幕共享对象成功加入频道回调。包含如下参数：
   * - uid：该对象的用户 ID
   */
  /** Occurs when the user for sharing screen joined the channel.
   * - uid: The User ID.
   */
  on(evt: 'videoSourceJoinedSuccess', cb: (uid: number) => void): this;
  /** @zh-cn
   * 屏幕共享对象 Token 已过期回调。
   */
  /** Occurs when the token expires. */
  on(evt: 'videoSourceRequestNewToken', cb: () => void): this;
  /** @zh-cn
   * 屏幕共享对象离开频道回调。
   */
  /** Occurs when the user for sharing screen leaved the channel.
   * - uid: The User ID.
   */
  on(evt: 'videoSourceLeaveChannel', cb: () => void): this;
  /** @zh-cn
   * 远端用户视频流状态发生改变回调。包含如下参数：
   * - uid：发生视频流状态改变的远端用户的用户 ID
   * - state：远端视频流状态。详见 {@link RemoteVideoState}
   */
  /** Occurs when the remote video state changes.
   *  - uid: ID of the user whose video state changes.
   *  - state: State of the remote video: Playing normally or frozen. See {@link RemoteVideoState}.
   */
  on(evt: 'remoteVideoStateChanged', cb: (uid: number, state: RemoteVideoState) => void): this;
  /** @zh-cn
   * 相机对焦区域已改变回调。包含如下参数：
   * - x：发生改变的对焦区域的 x 坐标。
   * - y：发生改变的对焦区域的 y 坐标。
   * - width：发生改变的对焦区域的宽度。
   * - height：发生改变的对焦区域的高度。
   */
  /** Occurs when the camera focus area changes.
   * - x: x coordinate of the changed camera focus area.
   * - y: y coordinate of the changed camera focus area.
   * - width: Width of the changed camera focus area.
   * - height: Height of the changed camera focus area.
   */
  on(evt: 'cameraFocusAreaChanged', cb: (x: number, y: number, width: number, height: number) => void): this;
  /** @zh-cn
   * 摄像头曝光区域已改变回调。包含如下参数：
   * - x：发生改变的曝光区域的 x 坐标。
   * - y：发生改变的曝光区域的 y 坐标。
   * - width：发生改变的曝光区域的宽度。
   * - height：发生改变的曝光区域的高度。
   */
  /** Occurs when the camera exposure area changes.
   * - x: x coordinate of the changed camera exposure area.
   * - y: y coordinate of the changed camera exposure area.
   * - width: Width of the changed camera exposure area.
   * - height: Height of the changed camera exposure area.
   */
  on(evt: 'cameraExposureAreaChanged', cb: (x: number, y: number, width: number, height: number) => void): this;
  /** @zh-cn
   * Token 服务即将过期回调。
   * 在调用 {@link joinChannel} 时如果指定了 Token，由于 Token 具有一定的时效，在通话过程中如果 Token 即将失效，SDK 会提前 30 秒触发该回调，提醒 App 更新 Token。
   当收到该回调时，用户需要重新在服务端生成新的 Token，然后调用 {@link renewToken} 将新生成的 Token 传给 SDK。
   * 包含如下参数：
   * - token：即将服务失效的 Token
   */
  /** Occurs when the token expires in 30 seconds.
   *
   * The user becomes offline if the token used in the {@link joinChannel} method expires. The SDK triggers this callback 30 seconds
   * before the token expires to remind the application to get a new token. Upon receiving this callback, generate a new token
   * on the server and call the {@link renewToken} method to pass the new token to the SDK.
   *
   * - token: Pointer to the token that expires in 30 seconds.
   */
  on(evt: 'tokenPrivilegeWillExpire', cb: (token: string) => void): this;
  /** @zh-cn
   * 开启旁路推流的结果回调。
   * 该回调返回 {@link addPublishStreamUrl} 方法的调用结果。用于通知主播是否推流成功。
   如果不成功，你可以在 error 参数中查看详细的错误信息。
   * 包含如下参数：
   * - url：新增的推流地址。
   * - error：详细的错误信息：
   *   - 0：推流成功
   *   - 1：推流失败
   *   - 2：参数错误。如果你在调用 {@link addPublishStreamUrl} 前没有调用 {@link setLiveTranscoding} 配置 LiveTranscoding，SDK 会返回该错误
   *   - 10：推流超时未成功
   *   - 19：推流地址已经在推流
   *   - 130：推流已加密不能推流
   */
  /** Reports the result of CDN live streaming.
   *
   * - url: The RTMP URL address.
   * - error: Error code:
   *  - 0: The publishing succeeds.
   *  - 1: The publishing fails.
   *  - 2: Invalid argument used. For example, you did not call {@link setLiveTranscoding} to configure LiveTranscoding before calling {@link addPublishStreamUrl}.
   *  - 10: The publishing timed out.
   *  - 19: The publishing timed out.
   *  - 130: You cannot publish an encrypted stream.
   */
  on(evt: 'streamPublished', cb: (url: string, error: number) => void): this;
  /** @zh-cn
   * 停止旁路推流的结果回调。
   * 该回调返回 {@link removePublishStreamUrl} 方法的调用结果。用于通知主播是否停止推流成功。
   * 包含如下参数：
   * - url：主播停止推流的 RTMP 地址。
   */
  /** This callback indicates whether you have successfully removed an RTMP stream from the CDN.
   *
   * Reports the result of calling the {@link removePublishStreamUrl} method.
   * - url: The RTMP URL address.
   */
  on(evt: 'streamUnpublished', cb: (url: string) => void): this;
  /** @zh-cn
   * 旁路推流设置被更新回调。该回调用于通知主播 CDN 转码已成功更新。
   */
  /** Occurs when the publisher's transcoding is updated. */
  on(evt: 'transcodingUpdated', cb: () => void): this;
  /** @zh-cn
   * 导入在线媒体流状态回调。该回调表明向直播导入的外部视频流的状态。
   * 包含如下参数：
   * - url：导入进直播的外部视频源的 URL 地址。
   * - uid：用户 ID。
   * - status：导入的外部视频源状态：
   *   - 0：外部视频流导入成功
   *   - 1：外部视频流已存在
   *   - 2：外部视频流导入未经授权
   *   - 3：导入外部视频流超时
   *   - 4：外部视频流导入失败
   *   - 5：外部视频流停止导入失败
   *   - 6：未找到要停止导入的外部视频流
   *   - 7：要停止导入的外部视频流未经授权
   *   - 8：停止导入外部视频流超时
   *   - 9：停止导入外部视频流失败
   *   - 10：导入的外部视频流被中断
   */
  /** Occurs when a voice or video stream URL address is added to a live broadcast.
   * - url: Pointer to the URL address of the externally injected stream.
   * - uid: User ID.
   * - status: State of the externally injected stream:
   *  - 0: The external video stream imported successfully.
   *  - 1: The external video stream already exists.
   *  - 2: The external video stream to be imported is unauthorized.
   *  - 3: Import external video stream timeout.
   *  - 4: Import external video stream failed.
   *  - 5: The external video stream stopped importing successfully.
   *  - 6: No external video stream is found.
   *  - 7: No external video stream is found.
   *  - 8: Stop importing external video stream timeout.
   *  - 9: Stop importing external video stream failed.
   *  - 10: The external video stream is corrupted.
   *
   */
  on(evt: 'streamInjectStatus', cb: (url: string, uid: number, status: number) => void): this;
  /** @zh-cn
   * 本地发布流已回退为音频流回调。
   *
   * 如果你调用了设置本地推流回退选项 {@link setLocalPublishFallbackOption} 接口并将 option 设置为 AUDIO_ONLY(2) 时，
   当上行网络环境不理想、本地发布的媒体流回退为音频流时，或当上行网络改善、媒体流恢复为音视频流时，会触发该回调。
   如果本地推流已回退为音频流，远端的 App 上会收到 userMuteVideo 的回调事件。
   *
   * 包含如下参数：
   * isFallbackOrRecover：本地推流已回退或恢复：
   * - true：由于网络环境不理想，本地发布的媒体流已回退为音频流
   * - false：由于网络环境改善，发布的音频流已恢复为音视频流
   */
  /** Occurs when the locally published media stream falls back to an audio-only stream due to poor network conditions or switches back
   * to the video after the network conditions improve.
   *
   * If you call {@link setLocalPublishFallbackOption} and set option as AUDIO_ONLY(2), the SDK triggers this callback when
   * the locally published stream falls back to audio-only mode due to poor uplink conditions, or when the audio stream switches back to
   * the video after the uplink network condition improves.
   *
   * - isFallbackOrRecover: Whether the locally published stream falls back to audio-only or switches back to the video:
   *  - true: The locally published stream falls back to audio-only due to poor network conditions.
   *  - false: The locally published stream switches back to the video after the network conditions improve.
   */
  on(evt: 'localPublishFallbackToAudioOnly', cb: (isFallbackOrRecover: boolean) => void): this;
  /** @zh-cn
   * 远端订阅流已回退为音频流回调。
   *
   * 如果你调用了设置远端订阅流回退选项 {@link setRemoteSubscribeFallbackOption} 接口并将 option 设置为 AUDIO_ONLY(2) 时，
   当下行网络环境不理想、仅接收远端音频流时，或当下行网络改善、恢复订阅音视频流时，会触发该回调。
   远端订阅流因弱网环境不能同时满足音视频而回退为小流时，你可以使用 remoteVideoStats 回调来监控远端视频大小流的切换。
   *
   * 包含如下参数：
   * - uid：远端用户的 ID
   * - isFallbackOrRecover：远端订阅流已回退或恢复：
   *   - true：由于网络环境不理想，远端订阅流已回退为音频流
   *   - false：由于网络环境改善，订阅的音频流已恢复为音视频流
   */
  /** Occurs when the remotely subscribed media stream falls back to audio-only due to poor network conditions or switches back to the video
   * after the network conditions improve.
   *
   * If you call {@link setRemoteSubscribeFallbackOption} and set option as AUDIO_ONLY(2), the SDK triggers this callback when
   * the remotely subscribed media stream falls back to audio-only mode due to poor uplink conditions, or when the remotely subscribed media stream switches back to the video
   *  after the uplink network condition improves.
   * - uid: ID of the remote user sending the stream.
   * - isFallbackOrRecover: Whether the remotely subscribed media stream falls back to audio-only or switches back to the video:
   *  - true: The remotely subscribed media stream falls back to audio-only due to poor network conditions.
   *  - false: The remotely subscribed media stream switches back to the video stream after the network conditions improved.
   */
  on(evt: 'remoteSubscribeFallbackToAudioOnly', cb: (
    uid: number,
    isFallbackOrRecover: boolean
  ) => void): this;
  /** @zh-cn
   * 麦克风状态已改变回调。该回调由本地用户开启或关闭本地音频采集触发的。
   * 包含如下参数：
   * - enabled：
   *   - true：麦克风已启用
   *   - false：麦克风已禁用
   */
  /** Occurs when the microphone is enabled/disabled.
   * - enabled: Whether the microphone is enabled/disabled:
   *  - true: Enabled.
   *  - false: Disabled.
   */
  on(evt: 'microphoneEnabled', cb: (enabled: boolean) => void): this;
  /** @zh-cn
   * 网络连接状态已改变回调。
   * 该回调在网络连接状态发生改变的时候触发，并告知用户当前的网络连接状态，和引起网络状态改变的原因。
   * 包含如下参数：
   * - state：当前的网络连接状态，详见 {@link ConnectionState}
   * - reason：引起当前网络连接状态发生改变的原因，详见 {@link ConnectionChangeReason}
   */
  /** Occurs when the connection state between the SDK and the server changes.
   * - state: See {@link ConnectionState}.
   * - reason: See {@link ConnectionState}.
   */
  on(evt: 'connectionStateChanged', cb: (
    state: ConnectionState,
    reason: ConnectionChangeReason
  ) => void): this;
  /** @zh-cn
   * 本地用户成功注册 User Account 回调。
   *
   * 本地用户成功调用 {@link registerLocalUserAccount} 方法注册用户 User Account，或调用 {@link joinChannelWithUserAccount} 加入频道后，
   SDK 会触发该回调，并告知本地用户的 UID 和 User Account。包含如下参数：
   * - uid：本地用户的 ID
   * - userAccount：本地用户的 User account
   */
  /** Occurs when the local user successfully registers a user account by calling the {@link registerLocalUserAccount} method.
   * This callback reports the user ID and user account of the local user.
   * - uid: The ID of the local user.
   * - userAccount: The user account of the local user.
   */
  on(evt: 'localUserRegistered', cb: (
    uid: number,
    userAccount: string
  ) => void): this;
  /** @zh-cn
   * 远端用户信息已更新回调。
   *
   * 远端用户加入频道后， SDK 会获取到该远端用户的 UID 和 User Account，然后缓存一个包含了远端用户 UID 和 User Account 的 Mapping 表，并在本地触发该回调。
   * 包含如下参数：
   * - uid：远端用户的 ID
   * - userInfo：标识用户信息的 UserInfo 对象，包含用户 UID 和 User account
   */
  /** Occurs when the SDK gets the user ID and user account of the remote user.
   *
   * After a remote user joins the channel, the SDK gets the UID and user account of the remote user, caches them in a mapping table
   * object (UserInfo), and triggers this callback on the local client.
   * - uid: The ID of the remote user.
   * - userInfo: The UserInfo Object that contains the user ID and user account of the remote user.
   */
  on(evt: 'userInfoUpdated', cb: (
    uid: number,
    userInfo: UserInfo
  ) => void): this;
  /** @zh-cn
   * 本地视频状态发生改变回调。
   *
   * 本地视频的状态发生改变时，SDK 会触发该回调返回当前的本地视频状态；当状态为 3 时，你可以在 `error` 参数中查看返回的错误信息。 该接口在本地视频出现故障时，方便你了解当前视频的状态以及出现故障的原因。
   * 包含如下参数：
   * - localVideoState 当前的本地视频状态：
   *   - 0：本地视频默认初始状态
   *   - 1：本地视频采集设备启动成功
   *   - 2：本地视频首帧编码成功
   *   - 3：本地视频启动失败
   * - error 本地视频出错原因：
   *   - 0：本地视频状态正常
   *   - 1：出错原因不明确
   *   - 2：没有权限启动本地视频采集设备
   *   - 3：本地视频采集设备正在使用中
   *   - 4：本地视频采集失败，建议检查采集设备是否正常工作
   *   - 5：本地视频编码失败
   */
   /**
    * Occurs when the local video state changes.
    * - localVideoState: The local video state:
    *  - 0: The local video is in the initial state.
    *  - 1: The local video capturer starts successfully.
    *  - 2: The local video capturer starts successfully.
    *  - 3: The local video fails to start.
    * - error: The detailed error information of the local video:
    *  - 0: The local video is normal.
    *  - 1: No specified reason for the local video failure.
    *  - 2: No permission to use the local video device.
    *  - 3: The local video capturer is in use.
    *  - 4: The local video capture fails. Check whether the capturer is working properly.
    *  - 5: The local video encoding fails.
   */
  on(evt: 'localVideoStateChanged', cb: (
    localVideoState: number,
    error: number
  ) => void): this;
  on(evt: string, listener: Function): this;

  // on(evt: 'apicallexecuted', cb: (api: string, err: number) => void): this;
  // on(evt: 'warning', cb: (warn: number, msg: string) => void): this;
  // on(evt: 'error', cb: (err: number, msg: string) => void): this;
  // on(evt: 'joinedchannel', cb: (
  //   channel: string, uid: number, elapsed: number
  // ) => void): this;
  // on(evt: 'rejoinedchannel', cb: (
  //   channel: string, uid: number, elapsed: number
  // ) => void): this;
  // on(evt: 'audioquality', cb: (
  //   uid: number, quality: AgoraNetworkQuality, delay: number, lost: number
  // ) => void): this;
  // on(evt: 'audiovolumeindication', cb: (
  //   uid: number,
  //   volume: number,
  //   speakerNumber: number,
  //   totalVolume: number
  // ) => void): this;
  // on(evt: 'leavechannel', cb: () => void): this;
  // on(evt: 'rtcstats', cb: (stats: RtcStats) => void): this;
  // on(evt: 'localvideostats', cb: (stats: LocalVideoStats) => void): this;
  // on(evt: 'remotevideostats', cb: (stats: RemoteVideoStats) => void): this;
  // on(evt: 'audiodevicestatechanged', cb: (
  //   deviceId: string,
  //   deviceType: number,
  //   deviceState: number,
  // ) => void): this;
  // on(evt: 'audiomixingfinished', cb: () => void): this;
  // on(evt: 'remoteaudiomixingbegin', cb: () => void): this;
  // on(evt: 'remoteaudiomixingend', cb: () => void): this;
  // on(evt: 'audioeffectfinished', cb: (soundId: number) => void): this;
  // on(evt: 'videodevicestatechanged', cb: (
  //   deviceId: string,
  //   deviceType: number,
  //   deviceState: number,
  // ) => void): this;
  // on(evt: 'networkquality', cb: (
  //   uid: number,
  //   txquality: AgoraNetworkQuality,
  //   rxquality: AgoraNetworkQuality
  // ) => void): this;
  // on(evt: 'lastmilequality', cb: (quality: AgoraNetworkQuality) => void): this;
  // on(evt: 'firstlocalvideoframe', cb: (
  //   width: number,
  //   height: number,
  //   elapsed: number
  // ) => void): this;
  // on(evt: 'addstream', cb: (
  //   uid: number,
  //   elapsed: number,
  // ) => void): this;
  // on(evt: 'videosizechanged', cb: (
  //   uid: number,
  //   width: number,
  //   height: number,
  //   rotation: number
  // ) => void): this;
  // on(evt: 'firstremotevideoframe', cb: (
  //   uid: number,
  //   width: number,
  //   height: number,
  //   elapsed: number
  // ) => void): this;
  // on(evt: 'userjoined', cb: (uid: number, elapsed: number) => void): this;
  // on(evt: 'removestream', cb: (uid: number, reason: number) => void): this;
  // on(evt: 'usermuteaudio', cb: (uid: number, muted: boolean) => void): this;
  // on(evt: 'usermutevideo', cb: (uid: number, muted: boolean) => void): this;
  // on(evt: 'userenablevideo', cb: (uid: number, enabled: boolean) => void): this;
  // on(evt: 'userenablelocalvideo', cb: (uid: number, enabled: boolean) => void): this;
  // on(evt: 'cameraready', cb: () => void): this;
  // on(evt: 'videostopped', cb: () => void): this;
  // on(evt: 'connectionlost', cb: () => void): this;
  // on(evt: 'connectioninterrupted', cb: () => void): this;
  // on(evt: 'connectionbanned', cb: () => void): this;
  // on(evt: 'refreshrecordingservicestatus', cb: () => void): this;
  // on(evt: 'streammessage', cb: (
  //   uid: number,
  //   streamId: number,
  //   msg: string,
  //   len: number
  // ) => void): this;
  // on(evt: 'streammessageerror', cb: (
  //   uid: number,
  //   streamId: number,
  //   code: number,
  //   missed: number,
  //   cached: number
  // ) => void): this;
  // on(evt: 'mediaenginestartcallsuccess', cb: () => void): this;
  // on(evt: 'requestchannelkey', cb: () => void): this;
  // on(evt: 'fristlocalaudioframe', cb: (elapsed: number) => void): this;
  // on(evt: 'firstremoteaudioframe', cb: (uid: number, elapsed: number) => void): this;
  // on(evt: 'activespeaker', cb: (uid: number) => void): this;
  // on(evt: 'clientrolechanged', cb: (
  //   oldRole: ClientRoleType,
  //   newRole: ClientRoleType
  // ) => void): this;
  // on(evt: 'audiodevicevolumechanged', cb: (
  //   deviceType: MediaDeviceType,
  //   volume: number,
  //   muted: boolean
  // ) => void): this;
  // on(evt: 'videosourcejoinedsuccess', cb: (uid: number) => void): this;
  // on(evt: 'videosourcerequestnewtoken', cb: () => void): this;
  // on(evt: 'videosourceleavechannel', cb: () => void): this;
}

export default AgoraRtcEngine;
