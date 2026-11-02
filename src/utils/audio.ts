/**
 * Sound effects disabled as requested.
 */
class SoundController {
  public toggleMute(): boolean {
    return true;
  }
  public getIsMuted(): boolean {
    return true;
  }
  public playBuk() {}
  public playJanggu(_side?: 'snap' | 'boom' | 'duo') {}
  public playTick() {}
  public playCelebration() {}
}

export const soundFx = new SoundController();
