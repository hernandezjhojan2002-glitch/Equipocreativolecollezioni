/* ============================================================
   CONFIG
   ============================================================ */
const SUPABASE_URL = "https://yfppwtnrvkzlfigyvpgr.supabase.co";
const SUPABASE_KEY = "sb_publishable_7fruHz3lVitB6i1j5uA8bA_QR9NdCp1";
const BUCKET_ARCHIVOS = "archivos";
const UMBRAL_SOBRECARGA = 5; // tareas activas para considerarse "sobrecargado"
const UMBRAL_OPTIMO = 2;     // tareas activas mínimas para "óptimo" (menos = "bajo")
const DIAS_ALERTA_VENCIMIENTO = 3; // avisar cuando falten X días o menos

const supa = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ============================================================
   LOGO Y TEMA CLARO/OSCURO
   ============================================================ */
const LOGO_DARK = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAisAAACgCAYAAADNRiwaAAAnjElEQVR42u2debwsVXXvvz1cLghcuCiIgAoSBRVlnlQioKJEfBLlOYCICiJGgokIiZq8p0ZFUBEfSsSBITiAPhWNwQSfoE/iFZFJfQgBAygOIPN0gXO6+/2x9krvW3Sf0921q7qqz+/7+dTnwr3nVNWqvfdaa6+99toNhBBF8j1gF2AOaI35u/PAcuB04DigHf5umjSAHvBdYLcJ5aoC/m1PBD5YkW8rhBhCW59AiELZAFgx4e/2gnOw7ozJVQX8266jLiqEnBUhljrdYBg7TBZZWRbuMUtyVQH/tj11USHkrAghbAbv17i/N4tyVeXdhRA1oalPIIQQQgg5K0IIIYQQclaEEEIIIWdFCCGEEELOihBCCCGEnBUhhBBCyFkRQgghhJCzIoQQQgg5K0IIIYQQ00MVbIUQ06LH9Mrd+6GFXTWDEHJWhBBiGNMs1b92+HNdNYMQclaEECKLH374HeC08N9lRzjWxQ4y/Hn0TkIIOStCCAH0l36uB75dsXcSQshZEUKI/2I5FlVpUX5kw5efuihvRQg5K0IIMYRe5KRoGUYIMRRtXRZCCCGEnBUhhBBCiEnRMpAQYpqTpTaWs1LWFuZ46UkIIWdFCCEWZDVWnG1en0IIIWdFCFElfPl5X+BkrN5JN/q3h4H7xrhfD4vMPBiu5pCfaQJ3AV9EO4CEkLMihBAjOCvPCleZ3AqcG5yVBqqvIoScFSGEWIAya5x06UdWhBByVoQQYiSalLcj0Z2Vlj67EPVUFkIIIYQQclaEEEIIIeSsCCGEEELOihBCCCGEnBUhhBBCCDkrQgghhJCzIoQQQgghZ0UIIYQQs4yKwgkhpkmvxOf0UHl9IeSsCCHEmDRKek5LOk8IOStCCDEucww/JTk1Xm7/Xn12IeSsCCHEYswH3fNl4HhgGeUdaDgfnCTQkpAQclaEEGIR7gdu1WcQQshZEUJUlRaWs9ICOiU+VxEVIeSsCCHEyE6DdukIIRZFdVaEEEIIIWdFCCGEEGJStAwkRPVphIlFM+cEY9yaJl2KX55pRNc00PKTEHJWhBAJmA+OwyMzJpc7Q/NqYiGEnBUh6olXXX0FsG34/0kjAT2sIFqH0aMY7wZuwKI5RdRBWRvYgMl3Az0S3mvSqEwDq7kiZ0mIitPQJxCiUH4C7BqMcatm7/4cYFXGmWgEx+fHwO455XoYq2A7KfeN6XzFzAPLgVOAkyl/+7QQYgwUWRGi+vRIF9kYJzJTdMRhebgmZWWCd9hYEzch5KwIIfLjhdOm8dwyHLFp/K6X/J9T9xJCzooQQhTlEOX5Xd9ZpYiKEDVAdVaEEEIIIWdFCCGEEELOihBCCCHkrAghhBBCyFkRQgghhJCzIoQQQgg5K0IIIYQQclaEEEIIIWdFCCGEEGKKqIKtEMXSy1ySq3rvL4SQsyLEkmYtrKR7HcdaY0blAlgmHSjEbCgjIUR+dgRWYKcm1228XQncF947G4HYAdigpnIR5GkBN4VrkIxCCCGEEEIIsTiKrAhRLHU+2bfL8GjDrJxYvJCMQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQghRORolP68Znpl9bm/A+/QyV91ZyrILIcQo9qixgJ4c9HfSk3JWkhnoZuhInZzv2Qr36dakY7rsAPMzIHssTx7mKzgGWgnu06lYv0wlVxUY9m1T9ckq0g3XLPdbd0qaI8g7qn7qTtl5aRfc51PQSmD7x7HpSZ7XKKgDNocY1s2BJwFbAZsBjwXWATYE5oD7gPuB24GbgJvDdfcA4amg49KInLPswHsC8OQhsneAe4PsdwSZbwJ+DdxZE9mFEGIcxyI7cVk76Mgtgp7cFNgAeAywftCRq4M9uBW4MejIXwMPD3Aa8jpAYkYjK77MEXtbWwN7Ac8Hdg4dccWY9/0DcAPw78D3gUuBuzLGe9qGe5DsWwHPC7LvAmwZBt443AZcD6wCfgD8KOO8lCG7O577Af8tyDjujM5DuL8FToj6Xm/Kfb8XHOh3MTjMPI5snwht1ZyygnS5tgD+tsa6qReNqfeFfu+y+TfeDXh9+O9ZibC4LOcClwzoT4Pad5K+O41+m9VXjWAX9gGeC+wQ5BpHv8wFvXJl0I8Xhf/uLaCbixpzBF2y+YRt4m1/HfCPBUSJvI0PA3adUJfH73jqInrcn/c6YI+ctuM3qT5A/AIbA28JnWY1j15X7AaPem6RqzPgd3vA74GzgZcAyxKHmibppLHsjwOOAC4EHsgpe3fA7/8B+AJwALC8JNk9rPn+Ie0xznVTQY7ypP0WYKcEcvWAF2UiX9OWa5dEclXh2iojm/fJI2ZIxuz19oys2fbdtUb9NqufdgiTlp8NeafOCHpyfgEbcTXwQWD7BXR1UZP+mxK1yylD2j9vOwCcn+D9fpLpjws976sJnverds4GakYe6zOAo4BXA5tEP9eJZkONCTpNnKvRDKHB14fr/wGfBc4MIUL/QJ0SjII/pwNsE2R/TXi/omR/PHBIuK4Lsp8RRZqKlP2BoCDmJxhA7o3fWcGZrMs0aWTFZXukYnK5Qq97ZGV+gT69Ovr3WcrPaQEPjtG+eWbxRfbbZiQTwEuBt4UobSszBuPE2uaY/SS+2sCzw3U88K/AacB3wns0I/mL4M4QWZk02udRirdj0fRvFKDX78mhy71/3lXS83LbjrgRtgJOz0RR/MW6Bcw4ugO86l+Fxl27hEhDM7r3FsAnM1GUsmW/GTgOWLcg2dtReLMXlOS4792JZjxVi6xsn3EKJ5Vt74pFVnaoeWShG/W3Jw+JrBwajblZiai4LG9ZJLKy44BvVaV+G99vf2wJP37+QtHzvFdngJ76fhRFSi1vrMuuznzfSd+/g+UvPnGECMa4bfKFHLrc++f/GSOycmYC23FFc0Lj1Q1/HgdcDhwZHAUXpFWgw+DRCV8P6wBPCWGzS4P33oneI/UAdI/8r7G10bdhCWDTkv1JwEnAZcDLC5RdCCFG0VEecd8KOA+4AMvd60b6qU1xeUbNcH83dt3w/AuBLwXnt8N0UgdGff8esBFwDv2E5MZS7ljNMTthKxjl7YEfBiO5MjLU7ZI/aDNyIOZD6O/bWHLSitAhU635tcP9tgvhuZOxHJVpy+7e7tOxtcjPh04+S6FxIUQ97IlHeo4IE9lXRU5Ks2QHIZ7cudPy2vBeb2TNZfqq4bb2+cB7w3+3lnrnGrXRPaP6CGxnzh5TNNTDPGnfqnYUlhm+E5Otkw2aKcwDbwj33atCsjcysr8pvOMeiZ01IYRYyLh2gfWwZYbPhols7KRM+/1cjz8Wy/U7A4uKdyvqCLjD8nfAC5e6wzKKs+KGuAt8PHTCdSND2KiYPN4hnxkiIK/M4bDEsp+Arb2tXwPZtwEuxraMLXmPXAhRuFH15fjvYxsA4mXxKhEvD70R+B6WF1LFSHScbHwWtnGlqpGgqTsrcULbV4C/qnAnzHbITvDy/zcWaRnXYYkdkXOwmgadGsm+dnjvv0YRFiFEsY7K9sFR2TnStVXNsfDloTksAv1/sd2sVXRYPD9xc2yJ33fHLLn8leYIxrodDP5/D43brsmH8rBkF8theecYDku8je6LIUIxR3UTsgbJ7rOHk4H/Qf7lMCGEGOSo7BJFKOqkZ5aF990SS759ekUdFl8OOgA4liUaLW8uYKzdo/siVrl0jjWLsNVFPs+1+QgW9psfwUlzR+csLCGrjrLHuTbvA46WwyKESKhbvcbUt7A8kDpGcD0SvTnwXazqeofqLbW4Y3gC/XzR1lLrcAt9mFPoR1SW1VRGN9pzWEKVZ6e3FvFiT8DqONRddm/LU4FXoBwWIepAlc/98l0/K4FvYuee1Xn3YStyWM6nfyxKlaLoHulfhi3vr2CJ5a80FzDWh2OF1uZrbKydbpBhDkuQZRFH5WAsR2UWZPdO7pGip1d05iCE6OurqkYoXJ/0sF0/28zIBMh1/3ZBT1Zxh5BHs/6E/tlBS0aPt4d8jGeEmXiRDTbskKZJSi4vhC993IiV6L+ENY8JKLMjxNUmszLGVfuaiZ/tsq0fFMxz6Je41snNYiE6U+ojcbn9hX6mQznHa2R1VFFGwidWd1d4gtsB3g38GcUsLWePGYkdJP+3BukTTdtBngOBd2D5fq0p9K9RnKqDsYTmz0bvvWScFe8QbeBzwDoFzMC70ayhOUKHzVNlsBc969+wfJXfD+l8cULt5+kXlGslHHy+nttaQAEOev9W4k6+E1Zk6F0VHIiimjPOaeuoYbpiLfoVo2cBj+T+E7apoVkxI+SOyk5YHlzqpR93UIa16aCJbCex8+g68UNY0u0vmP5J6sPe8RRgVXjHmdfl7QEd8e3Anok95tjweqe6Plw3YucKNbC1wq2Bp2Hrh+2oQ47jRXtUpBW84+Oi53cWGIRHAn+aWHYf0L6//zJsq9xV2JlGDwW5VgBPDYpgXyy82spEW1J18mOxI+ivlsMiFolsXBg5+b0pPL9D/5DSXubPm8JE5BHKCYe3wrM2BXZj8sMvhzkqPrE6vIJjshHpyk/ST0xNJX/s+NyBVUj/EXZY7a3YEv5a2GGuzwCeCzwPS+ydxEYsJufyIOc+FRyb/o6PwSLle4Z+uSQi5d7Im2KnG3ZIdxBf9tC9D2Fb3ZYv8D4bhE5yKvDHIfcadvlhSfdhW45ZxPN2b/1xYVCklH0+epdTscPHRmFZkP9rA+RK9U6jHEQVO7Q6yHBpHWTocu0iv+1R4+ES8h9WN0hnXYYt1S6kr6Z1kKHrgTck1kfxN7weOIY1T65fiMcDbwWuGdNGjKMnXztgYj/MeYA0BxmO229OG+Ed4zau5UGG2ZueQtpTTP0+D2NLDysHDLx2dLUGCL85cGKIQCz2bv4xrgkRCm/Axggf9B8SDsL4wK7zgW0zHbsdhTqbURRo0DLR3thZFkW0y/4jKCo5K0vbWdknyBQvuZR9LWQkmiVcrp/WAS4qyChej+2qWcwATMNZ8QndeiES3k0kfyd6//eH6HKsl7N6sjVET64doucPJNSTPmm9LkysGwvorGk5K7E+fvUIDkvtnRV/2GYh3NpNFFlwoa4Dds0Yv8XCdY2oUzo7YaccDxI6Hjxfi5yi9oiKfeMQekwxCOPv984Bco8a5osV9XIs6de/azdR21wyQoeTs7K0nZXnV0SuaYbcXfavFhRVuC2a0LRGbN8ynRXXAUcmdgZ62BLjCzPPaozRNrGO3zGKsqR4R7/H6xexJ9N0Vtxm3YUdd7CQPq+1sxLvOjmC/rk3eQ2Jrz9eieWAXBaWNhoZYzsMf8n5qENegR0g+E3WzH6OE6zeh50FdBf9hNJRBv6h9E8qzrP2HX/gVwMfZc0DtLpj3KcTfceHQ7jz3fQL1uVZm/R7PDesd3ZR7RUhho2VDpa/cBDp8tl8R8tqbPfJtfTzQKpGJ+jvvyRNno7nFN4CvCAYvnZkH0bVbb2MjbgyONerSJeL18PyOJukzdFJ6Uz3gA2x+ivtRaJAtcUbYC3gsBE8pVE7YgvLTzkAywNpR17VJJ3F9/HfHxTGt8I9Hw5/fyfw59hSU5PBW5OHDcI2ltCWN4m1Fw3CN2NnKS2Lwol5FIUPxhOADyQaiN3ISRVCDI4ozGPHVbwtoaMSzxxfgyWSVnX7qSdW74XVIMmrJ13vPAC8LERClo3ppAyzEW0sx/FlWGJuK6fuddl3CpO6qhZh84n5c4APUu8CfQs6K70Q/XgK+WuLxKGi1wG/SzgIO5ETcnDwopcDPw0RgvPDs7ojdlDviHti2eUkGIQt7GTqs+gXoSORcnPH6u8jWTs5OzjYUQorKzprENXQEaPklaTMEalCP3S99RdYxLaIHYJviSZeVa+TcWg0Icury5rYktJVifWkt9EdYVJ7X/TMvM7VIRVvH3dYjsdyEWeuUrkb5wMzDZPXYJ+G5UOkHoTuTD0QBvrnsLDftRM8q5GRvZPgva7BKt+2ClA+cTGko7B17jz7/31b6OPob89TVVuR5YHQTx6hvzQ56OomvKa9/dJ1ySuBTyWeqbpBfU/QX8sq7Ki4jlgX2I/89Uz8O34D+BL9iHtK/PteGwx33hopLu/+WCJvVSd1jSj4cAa2o2qmKty2w2B5fgJj5cV87sB21hRVSMc7y2Xh8veen3DgvCCRoW6EwfEIxdWk8CJ3t4bZ3qdyfmOPhL0Y+LoiK2IAe2ARzMUiefdOoMjjGireHxthRnz3lB2VvbFDXLsJoz1uSE/FSjhUPaLikexdsQ0YeYyfR1QeChO6BsUVWvOowulYMdDdcjic7gA8GUvgXcXoaQbTaq9NgbODXo9rddXeWdkGK8KW12D7MsUXgNspttiYK7UGk4Um3ZHaEjsrJ4/sPgguBf6lhI7sy2FnYruNtsqhRFwJ74mKw4nBM8pPFPycuQHG/GPY7rOyjblHRHcIs//l9KOZqRyV87BaIj7eqmxEXO69oslSHj3Zxirz/kcJ+sZtw4ewZfO8OrcdvsOqik/qvA/vh23IqINTPLJC2hVLsO0m+EhdrFR0GY0Zb9mbVBFvH2RPMWg+nShCM+oMZXVwWCDfUhDYeUhbsMRO8RQj97dRrklZFl3Lw5/TOMTPjeeWWB7JhqQ7bsQdlYuwbbBNqrHctRiuV3bP6Is8zu/nS7IPvkvogsg5ymvjdovGRJXxvvz+4GDNRP5Kk35V1bxJSA2spkq8z7zqPDun7L70dR/wnZyOwyTf+2tRR5xEBg/FroOV+gctBYlH95FRrnEcm1GqmZatBztY+YJvA08kXZ6Kz8qvxpI+H6mJwXPdsIx+5H1S3eARmRtDZCJFou6oRnsOi5Ll0c3uaG0bOQKNGozZVggerJyFiWiTfjGiPB/fO8Eq6rFtyhXFUxPNPH6K5ZGUdeCVP+PacOU5E6Kb+RZyVkTRjs0ojk+Z79zDkifPB56Z2FHxMg4vo1//qVuTtgQrmLlZAmcFbIv2w5R3zpQ/Y9SjRRb7Fpvx6CrsVbbtHin8DDOQbNtM0BFjrqqJwetFnS/P+/p9LqfYY+OHtV0X28KdIqKzhWytWILOlY/Zc0kbMvedkXcFR+U31DMvbGNsN1AKvX55yfbBdeLPseh3k8kj0GBLgxuXJEMKZ87zVw7CtuA/XOfJaBPbuprKC78x4YcuUkG5l7lRoo537RRk9ne+LqFSqnrbCZHaUelg+WYvJ23RN4JxeEUwllWtTruYftkowWQoq6vK1jG3A7/N+Wzf1PG4EpyVOdKdoOwO8sewQ0l71DR/pYmFP1PcB6ySbF1osfDJz+PI/YcpGvpbEymlDWW/xBLCnYcPYAXKUjoqPhk6BPg+9d6NsUEC3eZ68q6S390djA5W2TaFjl5e4Pu6M3sG8GPSbO92/b42Vo5/WXCia+msLNWZ9HLsFNEUXvI016DvTSTDWrJfYgk5KnPYmS/vSeyoeJ7K0VgCfF0dlUZCveBRgoenMKlzOfK2QTfjvBXlXIFVfn8D6RLOfTloW+zIlocS2YzSnZVGAR+7Dsxh23/r9t5Z1kkkQxchloajMo8d2XEKaTcE+M6ff8AKNs5CfYtUhwE2wqx+Wkaykej3HyzhXR+LLZm9h3R5Tu3QDsdilZmhZstBzUSDyQ3lujWSfZ784TA38CunOAgfl6jt7pEdE0vEUXkRVuGziOq0n8YOPqxbjsowvZAicuv3Wm8KDoqXedgwpxxlOitzoV+eiNWJSdWXGolsxtSclTsTduwnTtFoj+vldyIDnTcq8ZQpyrN1ovvcWYO2E2JSPBS+C/3lmVT93R2V87FdF3WoTjsq9yT4Tj6p23JKOmYF/d2OeZ2VuxPZjFG+WQs4HMuJTFkWo5b9skk/QbOXQPhn1Uhu6CfG5vVUd5xCJ3BP+9mJFMBvZc/EDDsqneDYfxNYn3R1J9xR+SG2tOSz+bo7Kv7+t5Fud8r2JcsQV+h+bDRRnfRbPIjtLCqLdrBRhyfuV7WckDaBGxIYWhd+94whrSqptlrHcj+G8iobemL0ppECaOa4V4pvIWaTTjDIZV7dxGOlA2yCnd21GenK6HuOyjXYFuXVMzSGYmcl725H14nPox/VLnNSmve5vWhye3uJbez96wJs63HdlxZzN+bVCTvFjsCTqE9p31/k9DQ9NLd5NCCaJQ7Cl2DrwJ2cMnSYXg0EUf2oRLuka+3w53oJx0kPy6U7Hzu0NVVCrYfpf4cVffPDW2clUd11+IMJJjJesXY7+hXTy9CT3havzKnnXe4bsDzHMnfRen99N3DZUnZY2lip+LyFYhphRrRO6Bgfp/jS8w0mPxDM3+uqBLJ7OPlw4MKS2s3f/4gE92kCtwD/KWdFZBR0AzgJOwiuQTnr9E3gZ5l+Pql+8Otc7GTxVFuUPWnzXuCAMHZm4mTbIZOxy4E/zdn+HWw30CHA35Xg2Pn9dwCek1PP+/bhyzPfpaxx2MPOlDo02Ot1mHxJq9asCMYqPsU4zyFkvwydsuzS8+MqMkKj38SjD1Eb5+qG66Ewcys6uuID7oU537sXlGsPO7Z92Hd05f6u8LNzOfrG1QPaYJqKGGwZLU/fd9n2zrTPtOXagTSHCu5YQ53WiNrhrEjZ9xJc3fBtHgFenBkjZbbvjpl3KqLf+t+9IqMv8vSn32G1SpoF6wB/9y/l0FvZdz9gyLeK5bg6h172d/zogH7l//2mBPL0EtiMUc5b8u90ZgLbcUUzzA7+nfwnJftywrZYQZtuQYPYO/kmWIGbFRM8y73s1VhiXJ5TQD3xaTnwYYpdAotP0/xwgkhIqoO+xOyyMoyt5ZS3HJS3H3pC7YnAYUHBLks0y/XozxuBf5vRiAqZyNaPsLN18hxA6PbhCVitj26Bjr23/3OBV+d8luvzu7CDevNG/CbFo4JnBAdsyS0HuVL4F9KceOqG+wNY8ud8YgPoUYsecDLwt8AlWIKrH0DWGONeAN9KILsPjgOB1yRUjoOiHPMhyrEz+dff2yEi9K9THISi2tQtwXZZuMc7geNJt/RDNN6OBb4YntUh3WnT0zp5ejFD/YdoQpunbXz55DhsF2OqQyOzz+hhUfPTI/uT58ToHvAD4A6mW/XdE8PfCvyK2cqRGstZuZv8R3d7Q26ChV8bCWfsHlGYx5KNDsFCsc/Czt84JgoZtUZseLA8k1sTyd4NA+RZIeSVMrK0LNzzpcD7yL+jwb/VD7GlsCZyVkS98TL6hwEfIW11Wo/enhgmSi2KDcVXzUZ8iXRVYNcOzt56pNuZ5e/qE+bPAs9MdP9GkB+m60h6nsq99COGVesvhXbEVvAYz88Y8TxRhnlsPfd0+jkdrZz39PWy44APhvdcK9x7beATwJexU0I7IzgKvfAz9wBfTSC7d+IVIVqzZaJZXSNSwntFSqOZSHmckdChFGKajso88GehT6esTusG70wsmtumn2Rb1FUVXCf+M7aNOe+kxpeDtgO+EiZhKVIG3EZ0gqN6SAJnNd6AcEH0d9NujzYW6fqfpCvHX4sB7nwqeGvNhIrjzdi2wSOBB6KOM8oOnnjJp4PVMfkYcFTG+Yl/5jXY8sjhIWLQXKSD+d+fHu6bV3YfiFtiYcODsO1mk+xciiNJ8+FeZ4bZSN6CVv77N2JFssqqfdBgzcqhRc0IegP+v2gl41t8x1mKTCHbkq27MEDf7BEMYIO0uyVc1+xFmrpUo4zNv8d2MU3bGHmk+m4sWn58gmiFy7R/mNgdjOWEtKPJ7Tg614+NWQ6chiWhppgouhN1ZrBfVclPcoflBGAfbLNFyihi5SMsAN8mf9b3oMzhK+lnnQ9S7vE1KMFuf/rbjBd6Nw/LPoKtWWeVzUKK6LyEsvs97gfeNkCxtobMpprRNyCK1HyER2dHp3i/Y0b4Pil3A11RwT6fajfQzhWTawfS7AbaJ/SPtQaM1RTXKAm3jRHG7zbYcm6qMTLt6y8GTCjj9i1jN1D8zAbw5GC0O+TbOZrV19dk7EMzsgPD9GTWTuyMJQKn0uHuNN2F5V8utMuzjN1Aw8b5FsAfw/PK6PdT2w2UPR/jvcExINHMxD3oHYCLsS2ynwlRj4cW+d2VwL5YLZGXRB7lYobVveGPYNngRwUltpBX3MBOSj0wCifmTbjthqjSJ0PE58PY7oH5EWfNGwCvCjOZP4nCznmjPz5z+0/g85STq+LfchPgLQVGVrzezz2ZWeFVWNG7op5JmB3uUvD3vDcMeO9jd1F8bZ/7IkVYNVy/bIrl3W1S8AyzjPyAThRRrQoeyb4Zi8Aflyhy4Ttang5cFCI3Hwd+vsgYiiOlTweODnZirYTt79GLU7EE46ott3ib3BJ06tdmPcrazgyQn4YO86aEjd6KDORB4boB2wZ2VTCaDwalvxJ4WnBu9gxKKFYSo7xPvCx0YLjXm4MnOGhZyOX8RXCkjk40EJvRoHpeiFr9DFt2uTgYzzuxiogNLO9mUyw590VYVcwnjeikTRLafDf9pbmynJXNsVNpy+Y9wIcKMgIu2zumINcNwFMLdsJOwGpjtAsy1PeGNllIhpOCUo5/xpcu18fyKbYuIRReRj5Jj+JrkOSZ5JwIvB7YmDTnK8X24Y3A64Dvhjb9SejjD9LfYbkudnDs7ljdk32D7owNeCpH4DdY6kFVNx+4Q/X1MClOZbsqT1y/5Db6xY9Sh5A6Y/78PPlDVl1sDXhQ2I4oYrFRUIqpZR8UorsX+HVw2H4enrs65/ca9Xt8Z4TQb9ahzbMMFIdW5wq+4i2wD4U/jx0QVk21DBR/27JkeyT8eeWA/pxqGahK1y4Z2Xy8rodtu59mkayiwuxvGdBn429Q5jIQmZ85tKBvPkjX34ZVUL4CuB471mDQ73UTvofLddCI32Yay0Dxs1vBYbuKtGkclVwGir3J24C/xJK7Um4ri18+TqJqDJhZxPkbKbz2BvB+rOzymwfM0nw2cye2h/1brFk/IYUjGMvdDDPC9YEnDvCWe4nkz84WGmHp4CjKKZ8+aGCV6fV7NK6MWWqr5O/YpJwdXB2mvzVybsC3nsfyOl4cnLe1EGX0hRZwDvBy7GiVlDP5Fmsu8bRCBGfjIe9CAXrS5fkSlrZQ9d02btQfCk7kpWEszFw5/uaQsNJ52JJIUdnPniA1LME2pYHxiNE8lvvyY+y48Kyj5APxn4FTCpI9TgyLk7jiWcGwJONUYdyjsLVn1VURoxqQ9pSvYbpgQ9IsRYjxjGMzRH5upp8nmNIRb0UOyCA9SfQzKQ2y278bgiM8zQJw4+r2Fhahfwczup25uYD3fAyWXT0r5aS9052FbcMbFFnwRj8OS/haVqDs8ey4SbHr4V6g7iRsa+eSPmpczAypK2SL0QxjA6vN9Vos544CjfogPVmUXE1sKf5VWJJ+o0YTOne0Po0l286cjm8OMeq90AkPwsr61t1hmQuOx5nYiZ/D9vK7Fz+PnSnxyxmS/Tzgb1hCRYTEzNPQJ5iqYVyFnQM3bg2pqk5kG1gxuStrauw9beNILB9ypqLnzQW8zBbwe6wi5K9rbLTdWH8T297WGqHjNrFErv2xpK66yu4Z9Bdi65l1VypCiOroljaW23g0/fzAuumWbqTz3wB8o8b63vNU7sR2VsXBh5l1VtxLa2GZ2Pth58fUqRF7kbE+D4uUjNp4cV2B/bBtxnWUvY0lC/959O5yVIQQKR2WT2HFLz2HpC4RCY9EuKNyNvWPpHvU6yLsQOGZiaQ3RxC8FYz13sDlUWNW2eh56MsH0muwZa1xyq677Ddhe/lX1VD2M4BX0K9jo4RaIUQRDstpWA7LaqpX1G7Ye7ewKuMHzYijkrVd78UKsM5E/kpzDMFvxkpvf5l+hn7VPoBHFPysiGOwEKUnZvUmbPTfYecvnF1h2Ylk72H5KYfTTxyToyKEKNJhORd4Af08x04F9U43ij5cG2za12bIUXE76BPzwxi+oWTmnBU32k2s9PbBwF/Rr35alQ7pdVHa2FkT+2KlklvkW7dz2R/EQoVvxQq6VU12P0X6emzp6iTWrGsjhBBFOyyrsOrjXwn6xyeO0zaU8US2BXwBO47lpzPmqMROWQs7rPat9A/ZnXlnxYX3bWSfCA39vahDTstwd6KGmcfOltgTuCTy7nsJGt5l/zR2uusFFZMdbMlr99AuqWQXQohRHZYWdrDeq7Gy/LfQj0ZPw2lxJ8UnsjeHCfehWCJqHZas8tgHj3h9ru5OWXOChvezZa7GlkZej4XT3HB3SzCS3eij+3MvCA7UO6LIx3ziTu+OwS+Bl2JrtL8oWfa45LE/97vY8fVHYxVqZ3kACiGqbSB9YncOsBNwMhaVj52WIid3cQkKd1Luxc412glLZahbMnCe9mhhqyHXkL6IX2lMWiY5zo04BytL/Aas6t92mQ8F+U8Ljtfg4gJBveCknIqdaOzOS7fAThgfQXAuttXtUOyIgmcPkT1PwbdBsnu7XQj8L+zE2aJl98FfJydoPnr3UZy/utTt8L7QGUGuWaA3Q31yFP0yykaAuH0n6btdiqvQGlfj/iN2NtdnsB1Dh2BnsMVj1O1DI+czfRtyO7rn7diSz6nYobmuJ4u0D/NMVll5FH016dh5IAQWVmWcykn7Z2fMvjbpOP0vXZfnTIf4/IbVwD9ioaaXYUk9+2Bn32R/Jx5YjUU6O6xZ3dUb/zfBSfgnbIdSHCUqw1OOZX84yH1miLYchiWZbVCQ7L/DasacjZ0DETtERcq+Lv3y53Vzxtdd5GfqekrpRgv82zJm5/TVZTPUJ0fts48Z4ZukkLvIM5XiKMt12IaHk7Ddma8Cdh0gQyejHxsLGOC49L6X6fe/vxQrWfGVoDPLmMj6mGznbPv1CmiHdrCVfxMiXXn758oxfmdFgnG6UTtxh5zDjqv+OrB5MNovAnbDjvUe9XnZDno/Vu/lhyGacAkW1osN+jTCebHsHaymybeAJwTZ9wsDcusFFO5isj+AJc1eEmT/IZbdTebZRS09uWP2g+B8pj7csminshW+XXbG4t/rD1ieU90iDU3gtwMiD/7fv6+hXMP4/RAj9SPg8UHvVKlPNsK4XT1hxKMF/GTILLsXTVo+nqAP3bhI9CpFX+1EevoW7FThj2JLMi/CNkNsH9qyNeL3HdRHrgYuxk7i/ln0b60JogGTRC/A8gY3o5/nOEnbX1xAhMVXQz4OLA/fOs87/scI/cb/7euh3SexHd5Pb2kUMEjjQ/qcdYCnYceabwtsEwz6RuHf1g8f835s180fg3DXYDkhP4sGVezhdanO+ltjSHRneZB3+yD7tqEzPxY71ntF+Pn7guy3ByN0TbiuDLL3MoOvrCiSEEKkwpeys0sCmwDPwJbSnwlshZ22vCJEmR4T9OODYaJ6K7ZF+trgpFwTdGesj1tok8HM8P8BDNFW/gdoQ4IAAAAASUVORK5CYII=";  // logo negro, se usa en tema claro
const LOGO_LIGHT = "data:image/png;base64,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"; // logo blanco, se usa en tema oscuro
function logoHTML(heightPx){
  const h = heightPx || 28;
  return `<img class="brand-logo-dark" src="${LOGO_LIGHT}" alt="LE COLLEZIONI" style="height:${h}px;width:auto;">`
       + `<img class="brand-logo-light" src="${LOGO_DARK}" alt="LE COLLEZIONI" style="height:${h}px;width:auto;">`;
}
function getTheme(){
  try{ const s = localStorage.getItem('equipo_theme'); if(s) return s; }catch(e){}
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}
function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); const m = document.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute('content', t==='dark' ? '#121211' : '#f3f3f1'); }
function toggleTheme(){
  const nuevo = getTheme()==='light' ? 'dark' : 'light';
  try{ localStorage.setItem('equipo_theme', nuevo); }catch(e){}
  applyTheme(nuevo);
  refrescarGraficas();
}
// Las gráficas toman sus colores del tema al dibujarse: se redibujan al cambiarlo.
function refrescarGraficas(){
  if(STATE.mode==='jefe') renderJefeView();
  else if(STATE.mode==='admin' && ['dashboard','metas','solicitudes'].includes(STATE.activeTab)) renderAdminTab();
}
const ICONS = {
  dashboard:'<rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>',
  solicitudes:'<path d="M2 9.5L3.8 3.5h8.4L14 9.5V13H2z"/><path d="M2 9.5h3.5l1 1.8h3l1-1.8H14"/>',
  kanban:'<rect x="2" y="2.5" width="3.4" height="11" rx="1"/><rect x="6.3" y="2.5" width="3.4" height="7" rx="1"/><rect x="10.6" y="2.5" width="3.4" height="9" rx="1"/>',
  semanas:'<path d="M2 4h12M2 8h12M2 12h7.5"/>',
  calendario:'<rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 7h12M5.2 1.5v3M10.8 1.5v3"/>',
  talentos:'<circle cx="8" cy="5.3" r="2.6"/><path d="M2.8 14c0-3 2.3-4.6 5.2-4.6s5.2 1.6 5.2 4.6"/>',
  proyectos:'<path d="M2 4.5A1.5 1.5 0 013.5 3H6l1.5 2h5A1.5 1.5 0 0114 6.5v5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 11.5z"/>',
  tareas:'<rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5.3 8.2l2 2 3.4-4"/>',
  metas:'<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2.4"/>',
  links:'<path d="M6.6 9.4l2.8-2.8"/><path d="M7.2 4.6l.9-.9a2.9 2.9 0 014.1 4.1l-.9.9"/><path d="M8.8 11.4l-.9.9a2.9 2.9 0 01-4.1-4.1l.9-.9"/>',
  lock:'<rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.2 7V5a2.8 2.8 0 015.6 0v2"/>',
  clip:'<path d="M12.8 7.4l-4.6 4.6a3 3 0 01-4.2-4.2l5-5a2 2 0 012.9 2.9l-5 5a1 1 0 01-1.4-1.4L10 5.2"/>',
  link:'<path d="M6.6 9.4l2.8-2.8"/><path d="M7.2 4.6l.9-.9a2.9 2.9 0 014.1 4.1l-.9.9"/><path d="M8.8 11.4l-.9.9a2.9 2.9 0 01-4.1-4.1l.9-.9"/>',
  clock:'<circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.2 1.4"/>',
  check:'<path d="M3 8.5l3.2 3.2L13 5"/>',
  cal:'<rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 7h12M5.2 1.5v3M10.8 1.5v3"/>',
  print:'<path d="M4.5 6V2.5h7V6"/><rect x="2" y="6" width="12" height="5.5" rx="1.2"/><path d="M4.5 9.5h7v4h-7z"/>',
  sun:'<circle cx="8" cy="8" r="2.8"/><path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"/>',
  moon:'<path d="M13.4 9.6A5.6 5.6 0 016.4 2.6a5.6 5.6 0 107 7z"/>'
};
function ico(name, cls){ return `<svg class="${cls===undefined?'ico':cls}" viewBox="0 0 16 16" aria-hidden="true">${ICONS[name]||''}</svg>`; }
function themeToggleHTML(){
  return `<button type="button" class="theme-toggle" data-accion="tema" title="Cambiar tema" aria-label="Cambiar tema claro/oscuro">
    ${ico('moon','icon-moon')}${ico('sun','icon-sun')}
  </button>`;
}
applyTheme(getTheme());

async function sha256Hex(str){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

const ESTADOS_TAREA = [
  {key:'pendiente', label:'Pendiente'},
  {key:'en_progreso', label:'En progreso'},
  {key:'en_revision', label:'En revisión'},
  {key:'completada', label:'Completada'}
];
const PRIORIDADES = ['baja','media','alta','urgente'];
const ESTADOS_PROYECTO = ['planeacion','en_curso','en_revision','completado','pausado'];
const ESTADOS_TALENTO = ['activo','onboarding','inactivo'];

let STATE = {
  mode: null, // 'admin' | 'aprendiz' | 'jefe' | 'solicitar' | null
  talentoId: null, // for aprendiz mode
  talentos: [], proyectos: [], tareas: [], metas: [], avances: [], solicitudes: [],
  activeTab: 'dashboard',
  charts: {},
  filtroTareas: {talento:'', proyecto:'', prioridad:'', estado:'', q:''},
  calFecha: new Date(),
  vistaTablero: (function(){ try{ return localStorage.getItem('equipo_vista_tablero') || 'hoy'; }catch(e){ return 'hoy'; } })(),
  semanaOffset: 0,
  semanaTalento: '',
  vistaSolicitudes: (function(){ try{ return localStorage.getItem('equipo_vista_solicitudes') || 'actuales'; }catch(e){ return 'actuales'; } })(),
  solSemanaOffset: 0,
  vistaProyectos: (function(){ try{ return localStorage.getItem('equipo_vista_proyectos') || 'actuales'; }catch(e){ return 'actuales'; } })(),
  proyMesOffset: 0
};

/* ============================================================
   UTILS
   ============================================================ */
function $(sel,ctx=document){return ctx.querySelector(sel);}
function el(html){const d=document.createElement('div');d.innerHTML=html.trim();return d.firstElementChild;}
function fmtDate(d){ if(!d) return '—'; const dt=new Date(d+'T00:00:00'); return dt.toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}); }
function fmtCorta(d){ if(!d) return 'Sin fecha'; return new Date(d+'T00:00:00').toLocaleDateString('es-CO',{day:'numeric', month:'short'}).replace('.',''); }
function isAtrasada(t){
  if(t.estado==='completada') return false;
  if(!t.fecha_entrega) return false;
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const fe = new Date(t.fecha_entrega+'T00:00:00');
  return fe < hoy;
}
function toast(msg){
  const t = el(`<div class="toast">${msg}</div>`);
  document.body.appendChild(t);
  setTimeout(()=>t.remove(), 2800);
}
function talentoNombre(id){ const t = STATE.talentos.find(x=>x.id===id); return t? t.nombre : '—'; }
function proyectoNombre(id){ const p = STATE.proyectos.find(x=>x.id===id); return p? p.nombre : '—'; }
function initials(name){ return (name||'?').trim().split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function pillPrioridad(p){
  const map = {baja:'dim', media:'dim', alta:'warn', urgente:'danger'};
  return `<span class="pill ${map[p]||'dim'}">${esc(p)}</span>`;
}
function pillEstadoTarea(t){
  if(isAtrasada(t)) return `<span class="pill danger">Atrasada</span>`;
  const map = {pendiente:'dim', en_progreso:'warn', en_revision:'warn', completada:'ok', bloqueada:'danger'};
  const labels = {pendiente:'Pendiente', en_progreso:'En progreso', en_revision:'En revisión', completada:'Completada', bloqueada:'Bloqueada'};
  return `<span class="pill ${map[t.estado]||'dim'}">${esc(labels[t.estado]||t.estado)}</span>`;
}
function diasParaVencer(t){
  if(!t.fecha_entrega) return null;
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const fe = new Date(t.fecha_entrega+'T00:00:00');
  return Math.round((fe-hoy)/86400000);
}
function pillVencimiento(t){
  if(t.estado==='completada' || isAtrasada(t)) return '';
  const d = diasParaVencer(t);
  if(d===null || d>DIAS_ALERTA_VENCIMIENTO) return '';
  const label = d===0? 'Vence hoy' : d===1? 'Vence mañana' : `Vence en ${d}d`;
  return `<span class="pill warn">${label}</span>`;
}
function avancesDe(tareaId){
  return STATE.avances.filter(a=>a.tarea_id===tareaId).sort((a,b)=> new Date(b.created_at)-new Date(a.created_at));
}
const LABELS_ESTADO = {pendiente:'Pendiente', en_progreso:'En progreso', en_revision:'En revisión', completada:'Completada', bloqueada:'Bloqueada'};
function tiempoPromedioEntrega(talentoId){
  const finalizadas = STATE.tareas.filter(t=>t.talento_id===talentoId && t.estado==='completada' && t.fecha_entrega);
  if(finalizadas.length===0) return null;
  const diffs = finalizadas.map(t=>{
    const entrega = new Date(t.fecha_entrega+'T23:59:59');
    const completado = entregaRealDe(t) || new Date(t.updated_at);
    return (completado - entrega) / 86400000; // + tarde, - temprano
  });
  const prom = diffs.reduce((a,b)=>a+b,0)/diffs.length;
  return Math.round(prom*10)/10;
}
function labelTiempoPromedio(dias){
  if(dias===null) return '—';
  if(Math.abs(dias)<0.3) return 'En el plazo';
  return dias>0 ? `${dias.toFixed(1)}d tarde (prom.)` : `${Math.abs(dias).toFixed(1)}d antes (prom.)`;
}

/* Cálculos de carga y cumplimiento */
function tareasActivasDe(talentoId){
  return STATE.tareas.filter(t=>t.talento_id===talentoId && t.estado!=='completada' && t.estado!=='bloqueada');
}
function nivelCarga(talentoId){
  const n = tareasActivasDe(talentoId).length;
  if(n >= UMBRAL_SOBRECARGA) return {n, label:'Sobrecargado', cls:'danger'};
  if(n >= UMBRAL_OPTIMO) return {n, label:'Óptimo', cls:'ok'};
  return {n, label:'Bajo', cls:'dim'};
}
function cumplimientoDe(talentoId){
  const finalizadas = STATE.tareas.filter(t=>t.talento_id===talentoId && t.estado==='completada');
  if(finalizadas.length===0) return null;
  const aTiempo = finalizadas.filter(t=>{
    if(!t.fecha_entrega) return true;
    return (entregaRealDe(t) || new Date(t.updated_at)) <= new Date(t.fecha_entrega+'T23:59:59');
  });
  return Math.round((aTiempo.length/finalizadas.length)*100);
}
function tareasAtrasadasDe(talentoId){
  return STATE.tareas.filter(t=>t.talento_id===talentoId && isAtrasada(t)).length;
}

/* ============================================================
   BOOT / ROUTING
   ============================================================ */
async function boot(){
  const params = new URLSearchParams(location.search);
  if(params.get('admin')==='1' || params.has('aprendiz') || params.get('vista')==='jefe'){ try{ localStorage.setItem('equipo_ultima_ruta', location.search); }catch(e){} }
  if(params.get('admin')==='1'){
    STATE.mode='admin';
    renderAdminGate();
  } else if(params.has('aprendiz')){
    STATE.mode='aprendiz';
    STATE.talentoId = params.get('aprendiz');
    await loadAll();
    renderAprendizView();
    subscribeRealtime(renderAprendizView);
  } else if(params.get('vista')==='jefe'){
    STATE.mode='jefe';
    await loadAll();
    renderJefeView();
    subscribeRealtime(renderJefeView);
  } else if(params.get('solicitar')==='1'){
    STATE.mode='solicitar';
    renderSolicitarView();
  } else {
    let ruta = ''; try{ ruta = localStorage.getItem('equipo_ultima_ruta') || ''; }catch(e){}
    if(/^\?(admin=1|aprendiz=|vista=jefe)/.test(ruta)){ location.replace(location.pathname + ruta); return; }
    renderNoAccess();
  }
}

function renderNoAccess(){
  $('#app').innerHTML = `
    <div class="gate"><div class="gate-card">
      <div class="crown-big">${logoHTML(44)}</div>
      <h2>Equipo creativo</h2>
      <p>Este acceso requiere un link válido. Si eres parte del equipo, pide tu link de acceso al administrador.</p>
    </div></div>`;
}

function renderAdminGate(){
  $('#app').innerHTML = `
    <div class="gate"><div class="gate-card">
      <div class="crown-big">${logoHTML(44)}</div>
      <h2>Acceso administrador</h2>
      <p>Ingresa la contraseña para gestionar el equipo creativo.</p>
      <input type="text" name="usuario" value="administrador" autocomplete="username" tabindex="-1" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;">
      <input type="password" id="admin-pass" name="password" placeholder="Contraseña" autocomplete="current-password" autocapitalize="off" autocorrect="off" spellcheck="false">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-dim);">
        <input type="checkbox" id="admin-show-pass" style="width:auto;"> Mostrar contraseña
      </label>
      <button class="btn" id="admin-login-btn">Entrar</button>
      <div id="admin-error" style="color:var(--danger);font-size:12px;"></div>
    </div></div>`;
  $('#admin-show-pass').onchange = (e)=>{ $('#admin-pass').type = e.target.checked ? 'text' : 'password'; };
  $('#admin-login-btn').onclick = tryAdminLogin;
  $('#admin-pass').addEventListener('keydown', e=>{ if(e.key==='Enter') tryAdminLogin(); });
  $('#admin-pass').focus();
}
async function tryAdminLogin(){
  const val = $('#admin-pass').value.trim();
  const btn = $('#admin-login-btn'); btn.disabled = true; btn.textContent = 'Verificando...';
  try{
    const { data } = await supa.from('config').select('value').eq('key','admin_password_hash').single();
    const hash = await sha256Hex(val);
    if(data && hash === data.value){
      STATE._adminHash = hash;
      STATE._adminPass = val;   // solo en memoria: abre la lista privada "Mis pendientes"
      await loadAll();
      renderAdminApp();
      subscribeRealtime(()=>{ if(STATE.mode==='admin') renderAdminTab(); });
    } else {
      $('#admin-error').textContent = 'Contraseña incorrecta.';
      btn.disabled = false; btn.textContent = 'Entrar';
    }
  }catch(err){
    $('#admin-error').textContent = 'No se pudo verificar. Revisa que corriste la migración v2 en Supabase.';
    btn.disabled = false; btn.textContent = 'Entrar';
  }
}

async function loadAll(){
  const [t,p,ta,m,av,so] = await Promise.all([
    supa.from('talentos').select('*').order('nombre'),
    supa.from('proyectos').select('*').order('created_at',{ascending:false}),
    supa.from('tareas').select('*').order('created_at',{ascending:false}),
    supa.from('metas').select('*').order('created_at',{ascending:false}),
    supa.from('avances').select('*').order('created_at',{ascending:false}),
    supa.from('solicitudes').select('*').order('created_at',{ascending:false}),
  ]);
  STATE.talentos = t.data || [];
  STATE.proyectos = p.data || [];
  STATE.tareas = ta.data || [];
  STATE.metas = m.data || [];
  STATE.avances = av.data || [];
  STATE.solicitudes = so.data || [];
  await cargarClaves();
  if(STATE.mode==='admin' && Date.now() - (STATE._pendCargadoEn||0) > 60000) cargarPendientes();   // sin esperar
}

function subscribeRealtime(cb){
  STATE._refrescar = cb;
  supa.channel('cambios-equipo')
    .on('postgres_changes', {event:'*', schema:'public', table:'talentos'}, async()=>{ await loadAll(); cb(); })
    .on('postgres_changes', {event:'*', schema:'public', table:'proyectos'}, async()=>{ await loadAll(); cb(); })
    .on('postgres_changes', {event:'*', schema:'public', table:'tareas'}, async()=>{ await loadAll(); cb(); })
    .on('postgres_changes', {event:'*', schema:'public', table:'metas'}, async()=>{ await loadAll(); cb(); })
    .on('postgres_changes', {event:'*', schema:'public', table:'avances'}, async()=>{ await loadAll(); cb(); })
    .on('postgres_changes', {event:'*', schema:'public', table:'solicitudes'}, async()=>{ await loadAll(); cb(); })
    .subscribe();
}

/* ============================================================
   SOLICITUDES (admin)
   ============================================================ */
function fmtFechaHora(iso){
  if(!iso) return '—';
  return new Date(iso).toLocaleString('es-CO',{day:'numeric', month:'short', year:'numeric', hour:'numeric', minute:'2-digit', hour12:true, timeZone:'America/Bogota'});
}

function renderMetricasSolicitudes(){
  const wrap = $('#solicitudes-metricas');
  if(!wrap) return;
  if(STATE.solicitudes.length===0){ wrap.innerHTML=''; return; }
  const pendientes = STATE.solicitudes.filter(s=>s.estado==='pendiente').length;
  const convertidas = STATE.solicitudes.filter(s=>s.estado==='convertida');
  const conteoPorArea = {};
  STATE.solicitudes.forEach(s=>{ conteoPorArea[s.area_solicitante] = (conteoPorArea[s.area_solicitante]||0)+1; });
  const areaTop = Object.entries(conteoPorArea).sort((a,b)=>b[1]-a[1])[0];
  let promDias = '—';
  if(convertidas.length){
    const dias = convertidas.map(s=> (new Date(s.updated_at||s.created_at) - new Date(s.created_at))/86400000).filter(d=>d>=0);
    if(dias.length) promDias = (dias.reduce((a,b)=>a+b,0)/dias.length).toFixed(1)+'d';
  }
  wrap.innerHTML = `
    <div class="card"><div class="label">Pendientes</div><div class="value ${pendientes>0?'gold':''}">${pendientes}</div></div>
    <div class="card"><div class="label">Total histórico</div><div class="value">${STATE.solicitudes.length}</div></div>
    <div class="card"><div class="label">Área que más pide</div><div class="value" style="font-size:26px;line-height:1.15;">${areaTop?esc(areaTop[0]):'—'}</div>${areaTop?`<div class="sub">${areaTop[1]} solicitud${areaTop[1]===1?'':'es'}</div>`:''}</div>
    <div class="card"><div class="label">Tiempo hasta convertir</div><div class="value">${promDias}</div><div class="sub">en promedio</div></div>
  `;
  const chartWrap = $('#solicitudes-chart-wrap');
  if(chartWrap && Object.keys(conteoPorArea).length>1){
    chartWrap.innerHTML = `<div class="chart-box" style="margin-bottom:20px;"><h3>Solicitudes por área</h3><div class="chart-canvas"><canvas id="chart-solicitudes-area"></canvas></div></div>`;
    destroyChart('chart-solicitudes-area');
    const th = temaGraficas();
    STATE.charts['chart-solicitudes-area'] = new Chart($('#chart-solicitudes-area'), {
      type:'bar',
      data:{labels:Object.keys(conteoPorArea), datasets:[{label:'Solicitudes', data:Object.values(conteoPorArea), backgroundColor:th.barra, borderRadius:10, borderSkipped:false, maxBarThickness:30}]},
      options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:ejesGraficas(th)}
    });
  } else if(chartWrap){ chartWrap.innerHTML=''; }
}

// 'actuales': TODAS las pendientes (sin importar su antigüedad) + las atendidas o recibidas esta semana.
// 'semana': las recibidas en la semana elegida. 'todas': el historial completo.
function solicitudVisible(s, vista, ctx){
  if(vista==='todas') return true;
  const rec = ymd(new Date(s.created_at));
  if(vista==='semana') return rec>=ctx.rango.ini && rec<=ctx.rango.fin;
  if(s.estado==='pendiente') return true;
  const act = ymd(new Date(s.updated_at || s.created_at));
  const sem = ctx.actual;
  return (rec>=sem.ini && rec<=sem.fin) || (act>=sem.ini && act<=sem.fin);
}

function renderAdminSolicitudes(){
  const view = $('#view-solicitudes');
  view.innerHTML = `
    <div class="section-title">Solicitudes de otras áreas</div>
    <div class="grid-cards" id="solicitudes-metricas"></div>
    <div id="solicitudes-controls"></div>
    <div id="lista-solicitudes"></div>
    <div id="solicitudes-chart-wrap"></div>`;
  renderMetricasSolicitudes();
  renderListaSolicitudes();
}

function renderListaSolicitudes(){
  const ctrl = $('#solicitudes-controls');
  const cont = $('#lista-solicitudes');
  if(!cont) return;
  cont.innerHTML = '';
  if(STATE.solicitudes.length===0){
    ctrl.innerHTML = '';
    cont.innerHTML = `<div class="empty-state">No hay solicitudes todavía. Comparte el link de "Solicitar tarea" con otras áreas desde la pestaña Links y respaldo.</div>`;
    return;
  }
  const vista = STATE.vistaSolicitudes;
  const ctx = {actual: rangoSemana(0), rango: rangoSemana(STATE.solSemanaOffset)};
  const visibles = STATE.solicitudes.filter(s=>solicitudVisible(s, vista, ctx));
  const ocultas = STATE.solicitudes.length - visibles.length;

  const opciones = [['actuales','Pendientes y esta semana'],['semana','Por semana'],['todas','Todas']];
  const f = d=> d.toLocaleDateString('es-CO',{day:'numeric', month:'short'});
  let detalle = '';
  if(vista==='semana'){
    const n = estado=> visibles.filter(s=>s.estado===estado).length;
    detalle = `
      <div class="week-nav">
        <button class="btn secondary small" id="sol-prev">‹ Anterior</button>
        <h3>${STATE.solSemanaOffset===0?'Esta semana · ':''}${f(ctx.rango.lunes)} – ${f(ctx.rango.domingo)} de ${ctx.rango.domingo.getFullYear()}</h3>
        <button class="btn secondary small" id="sol-hoy">Esta semana</button>
        <button class="btn secondary small" id="sol-next">Siguiente ›</button>
      </div>
      <div class="hint">${visibles.length} recibida${visibles.length===1?'':'s'} · ${n('pendiente')} pendiente${n('pendiente')===1?'':'s'} · ${n('convertida')} convertida${n('convertida')===1?'':'s'} · ${n('descartada')} descartada${n('descartada')===1?'':'s'}</div>`;
  } else {
    const texto = vista==='actuales'
      ? 'Todas las pendientes, sin importar cuánto lleven esperando, más lo recibido o atendido esta semana.'
      : 'Todo el historial de solicitudes.';
    const aviso = (vista==='actuales' && ocultas>0)
      ? ` · <a href="#" id="sol-ver-todas">${ocultas} ya atendida${ocultas===1?'':'s'} en semanas anteriores (ver todas)</a>` : '';
    detalle = `<div class="hint">${texto}${aviso}</div>`;
  }
  ctrl.innerHTML = `<div class="chips">${opciones.map(([k,l])=>`<button class="chip ${vista===k?'active':''}" data-vista-sol="${k}">${l}</button>`).join('')}</div>${detalle}`;

  const cambiar = v=>{ STATE.vistaSolicitudes = v; try{ localStorage.setItem('equipo_vista_solicitudes', v); }catch(e){} renderListaSolicitudes(); };
  ctrl.querySelectorAll('[data-vista-sol]').forEach(b=> b.onclick = ()=> cambiar(b.dataset.vistaSol));
  const verTodas = ctrl.querySelector('#sol-ver-todas');
  if(verTodas) verTodas.onclick = e=>{ e.preventDefault(); cambiar('todas'); };
  if(vista==='semana'){
    $('#sol-prev', ctrl).onclick = ()=>{ STATE.solSemanaOffset--; renderListaSolicitudes(); };
    $('#sol-next', ctrl).onclick = ()=>{ STATE.solSemanaOffset++; renderListaSolicitudes(); };
    $('#sol-hoy', ctrl).onclick = ()=>{ STATE.solSemanaOffset = 0; renderListaSolicitudes(); };
  }

  if(visibles.length===0){ cont.innerHTML = `<div class="empty-state">${vista==='semana'?'No se recibieron solicitudes esta semana.':'No hay solicitudes en esta vista.'}</div>`; return; }
  const orden = {pendiente:0, convertida:1, descartada:2};
  const lista = [...visibles].sort((a,b)=> (orden[a.estado]??9)-(orden[b.estado]??9) || new Date(b.created_at)-new Date(a.created_at));
  lista.forEach(s=>{
    const estadoPill = s.estado==='pendiente' ? '<span class="pill warn">Pendiente</span>'
      : s.estado==='convertida' ? `<span class="pill ok">${esc(textoConversion(s))}</span>`
      : '<span class="pill dim">Descartada</span>';
    const deAntes = s.estado==='pendiente' && ymd(new Date(s.created_at)) < ctx.actual.ini
      ? ' <span class="pill danger">De semana anterior</span>' : '';
    cont.appendChild(el(`
      <div class="list-row" style="align-items:flex-start;">
        <div class="flex-grow">
          <div class="person-name">${esc(s.asunto)}</div>
          <div class="person-role">${esc(s.area_solicitante)}${esc(s.nombre_solicitante?' · '+s.nombre_solicitante:'')}${esc(s.origen?' · vía '+s.origen:'')} · Necesitan: ${esc(fmtDate(s.fecha_necesaria))}${esc(s.hora_necesaria?' '+s.hora_necesaria:'')}</div>
          <div class="person-role" style="margin-top:2px;">${ico('clock')} Recibida: ${fmtFechaHora(s.created_at)}</div>
          <div class="meta" style="margin-top:6px;">${estadoPill} ${pillPrioridad(s.prioridad)}${deAntes}</div>
        </div>
        <div class="row-actions">
          <button class="btn secondary small" data-ver="${s.id}">${s.estado==='pendiente'?'Ver':'Gestionar'}</button>
          ${s.estado==='pendiente'?`<button class="btn danger small" data-descartar="${s.id}">Descartar</button>`:''}
        </div>
      </div>`));
  });
  cont.querySelectorAll('[data-ver]').forEach(b=> b.onclick = ()=> openSolicitudDetalleModal(b.dataset.ver));
  cont.querySelectorAll('[data-descartar]').forEach(b=> b.onclick = async ()=>{
    if(!confirm('¿Descartar esta solicitud?')) return;
    await supa.from('solicitudes').update({estado:'descartada', updated_at:new Date().toISOString()}).eq('id', b.dataset.descartar);
    await loadAll(); renderAdminSolicitudes();
    toast('Solicitud descartada');
  });
}

function openSolicitudDetalleModal(id){
  const s = STATE.solicitudes.find(x=>x.id===id);
  if(!s) return;
  const tieneMaterial = !!(s.archivo_url || listaLinks(s.links_referencia).length);
  const proyecto = s.proyecto_id ? STATE.proyectos.find(p=>p.id===s.proyecto_id) : null;
  const tareas = s.estado==='convertida' ? tareasDeSolicitud(s) : [];
  const resultado = s.estado==='convertida' ? `
    <div class="material-box" style="margin-top:14px;">
      <div class="material-title">Qué se hizo con esta solicitud</div>
      <div class="res-list">
        ${proyecto?`<div class="res-row"><span class="res-label">Proyecto</span><span class="res-main"><strong>${esc(proyecto.nombre)}</strong><span class="page-sub">${textoRango(rangoProyecto(proyecto))}</span></span><button class="btn secondary small" data-ir-proyecto="${proyecto.id}">Ver proyecto</button></div>`:''}
        ${tareas.map(t=>`<div class="res-row"><span class="res-label">Tarea</span><span class="res-main"><span>${esc(t.titulo)}</span>${pillEstadoTarea(t)}<span class="page-sub">${fmtCorta(t.fecha_entrega)}${esc(t.talento_id?' · '+esc(talentoNombre(t.talento_id)):'')}</span></span><button class="btn secondary small" data-abrir-tarea="${t.id}">Abrir</button></div>`).join('')}
        ${(!proyecto && tareas.length===0)?'<div class="material-row">No hay tareas vinculadas todavía.</div>':''}
      </div>
    </div>` : '';
  const aviso = (s.estado==='pendiente' && tieneMaterial) ? `<p class="hint" style="margin:10px 0 0;">Al convertirla, este material se adjunta a las tareas y el aprendiz podrá abrirlo.</p>` : '';
  const acciones = s.estado==='pendiente'
    ? `<button class="btn secondary cerrar-izq" id="cerrar">Cerrar</button><span class="acc-label">Convertir en</span><button class="btn secondary" id="convertir-proyecto">Proyecto del mes</button><button class="btn secondary" id="convertir-multi">Varias tareas</button><button class="btn" id="convertir">1 tarea</button>`
    : s.estado==='convertida'
      ? `<button class="btn secondary cerrar-izq" id="cerrar">Cerrar</button><button class="btn secondary" id="reabrir">Reabrir como pendiente</button>${proyecto?'':`<button class="btn secondary" id="convertir-proyecto">Convertir en proyecto</button>`}<button class="btn" id="agregar-tareas">Agregar tareas</button>`
      : `<button class="btn secondary cerrar-izq" id="cerrar">Cerrar</button><button class="btn" id="reabrir">Reabrir como pendiente</button>`;
  const overlay = el(`
    <div class="modal-overlay">
      <div class="modal wide">
        <h3>${esc(s.asunto)}</h3>
        <p class="person-role" style="margin:-8px 0 10px;">${esc(s.area_solicitante)}${s.nombre_solicitante?' · '+esc(s.nombre_solicitante):''} · Necesitan: ${esc(fmtDate(s.fecha_necesaria))}${s.hora_necesaria?' '+esc(s.hora_necesaria):''} · Tipo: ${esc(s.tipo||'—')}</p>
        <p class="person-role" style="margin-bottom:12px;">${ico('clock')} Formulario recibido el ${fmtFechaHora(s.created_at)} (hora de Colombia)</p>
        ${s.descripcion?`<p style="font-size:14.5px;margin-bottom:10px;white-space:pre-wrap;">${esc(s.descripcion)}</p>`:''}
        ${materialHTML({url:s.archivo_url, nombre:s.archivo_nombre, links:s.links_referencia}, 'Material de la solicitud')}
        ${aviso}
        ${resultado}
        <div class="modal-actions" style="flex-wrap:wrap;">${acciones}</div>
      </div>
    </div>`);
  document.body.appendChild(overlay);
  $('#cerrar', overlay).onclick = ()=> overlay.remove();
  overlay.querySelectorAll('[data-ir-proyecto]').forEach(b=> b.onclick = ()=>{
    overlay.remove(); STATE.activeTab = 'proyectos'; STATE.vistaProyectos = 'todos'; renderAdminTab();
  });
  overlay.querySelectorAll('[data-abrir-tarea]').forEach(b=> b.onclick = ()=>{ overlay.remove(); openTareaModal(b.dataset.abrirTarea); });
  const abrirProyecto = $('#convertir-proyecto', overlay);
  if(abrirProyecto) abrirProyecto.onclick = ()=>{ overlay.remove(); openConvertirProyectoModal(s); };
  const reabrir = $('#reabrir', overlay);
  if(reabrir) reabrir.onclick = async ()=>{
    await supa.from('solicitudes').update({estado:'pendiente', updated_at:new Date().toISOString()}).eq('id', s.id);
    overlay.remove(); await loadAll(); renderAdminTab();
    toast('Solicitud reabierta: vuelve a quedar pendiente. Lo ya creado se conserva.');
  };
  const agregar = $('#agregar-tareas', overlay);
  if(agregar) agregar.onclick = ()=>{ overlay.remove(); openTareasLoteModal({solicitud:s, proyecto:proyecto||null}); };
  if(s.estado==='pendiente'){
    $('#convertir', overlay).onclick = ()=>{
      overlay.remove();
      const descripcionCompleta = [s.descripcion, `Solicitado por: ${esc(s.area_solicitante)}${esc(s.nombre_solicitante?' ('+s.nombre_solicitante+')':'')}`].filter(Boolean).join('\n\n');
      openTareaModal(null, {
        titulo: s.asunto,
        descripcion: descripcionCompleta,
        tipo: s.tipo,
        fecha_entrega: s.fecha_necesaria,
        prioridad: s.prioridad,
        material_url: s.archivo_url || null,
        material_nombre: s.archivo_nombre || null,
        material_links: s.links_referencia || null,
        _solicitudId: s.id
      });
    };
    $('#convertir-multi', overlay).onclick = ()=>{ overlay.remove(); openConvertirMultiModal(s); };
  }
}

// Convierte la solicitud en un proyecto del mes (o de varios meses) y, si se quiere, pasa directo a planear sus tareas.
function openConvertirProyectoModal(s){
  const mes0 = (s.fecha_necesaria || hoyStr()).slice(0,7);
  const previas = s.estado==='convertida' ? tareasDeSolicitud(s) : [];
  const overlay = el(`
    <div class="modal-overlay"><div class="modal">
      <h3>Convertir en proyecto del mes</h3>
      <p class="hint" style="margin-top:-8px;">Un proyecto agrupa varias tareas y las ves por semana. Lo podrás extender a otro mes cuando lo necesites.</p>
      <div class="field"><label>Nombre del proyecto</label><input id="pr-nombre" value="${esc(s.asunto)}"></div>
      <div class="field-row">
        <div class="field"><label>Marca o cliente interno</label><input id="pr-marca" placeholder="Opcional"></div>
        <div class="field"><label>Color de marca</label><input type="color" id="pr-color" value="#8a8a84"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Desde (mes)</label><input type="month" id="pr-desde" value="${mes0}" placeholder="2026-10"></div>
        <div class="field"><label>Hasta (mes)</label><input type="month" id="pr-hasta" value="${mes0}" placeholder="2026-10"></div>
      </div>
      <p class="hint" id="pr-resumen"></p>
      ${previas.length?`<label class="check-row"><input type="checkbox" id="pr-incluir" checked> Incluir en el proyecto las ${previas.length} tarea${previas.length===1?'':'s'} ya creada${previas.length===1?'':'s'}</label>`:''}
      <label class="check-row"><input type="checkbox" id="pr-planear" checked> Planear las tareas ahora</label>
      <div class="modal-actions">
        <button class="btn secondary" id="cancel">Cancelar</button>
        <button class="btn" id="save">Crear proyecto</button>
      </div>
    </div></div>`);
  document.body.appendChild(overlay);
  const d = $('#pr-desde', overlay), h = $('#pr-hasta', overlay), res = $('#pr-resumen', overlay);
  const resumen = ()=>{
    if(!mesValido(d.value) || !mesValido(h.value)){ res.textContent = 'Escribe los meses con el formato AAAA-MM (por ejemplo 2026-10).'; return; }
    if(h.value < d.value){ res.textContent = 'El mes final no puede ser anterior al inicial.'; return; }
    const ms = mesesDelRango({ini:primerDiaMes(d.value), fin:ultimoDiaMes(h.value)}).map(nombreMes);
    res.textContent = ms.length===1 ? `Quedará en ${ms[0]}.` : `Abarcará ${ms.length} meses: ${ms.join(', ')}.`;
  };
  d.oninput = h.oninput = d.onchange = h.onchange = resumen; resumen();
  $('#cancel', overlay).onclick = ()=> overlay.remove();
  $('#save', overlay).onclick = async ()=>{
    const nombre = $('#pr-nombre', overlay).value.trim();
    if(!nombre){ toast('Ponle un nombre al proyecto'); return; }
    if(!mesValido(d.value) || !mesValido(h.value) || h.value < d.value){ toast('Revisa los meses: el final no puede ser antes del inicio'); return; }
    const rr = await supa.from('proyectos').insert({
      nombre, marca: $('#pr-marca', overlay).value.trim(), color: $('#pr-color', overlay).value,
      fecha_inicio: primerDiaMes(d.value), fecha_limite: ultimoDiaMes(h.value), estado:'en_curso'
    }).select();
    if(rr.error || !rr.data || !rr.data[0]){ toast('No se pudo crear el proyecto' + (rr.error ? ': '+rr.error.message : '')); return; }
    const proy = rr.data[0];
    const cambios = {proyecto_id: proy.id};
    if(s.estado!=='convertida'){ cambios.estado = 'convertida'; cambios.updated_at = new Date().toISOString(); }
    const u = await supa.from('solicitudes').update(cambios).eq('id', s.id);
    if(u && u.error){
      await supa.from('proyectos').delete().eq('id', proy.id);   // no dejar un proyecto huérfano
      toast('No se pudo vincular la solicitud: '+u.error.message+'. ¿Ya corriste la migración v6 en Supabase?');
      return;
    }
    const incluir = $('#pr-incluir', overlay);
    if(incluir && incluir.checked){ for(const t of previas){ await supa.from('tareas').update({proyecto_id: proy.id}).eq('id', t.id); } }
    const planear = $('#pr-planear', overlay).checked;
    overlay.remove();
    await loadAll();
    const pg = STATE.proyectos.find(x=>x.id===proy.id);
    if(pg) asegurarVisible(pg);
    renderAdminTab();
    toast(`Proyecto creado en ${nombreMes(d.value)}`);
    if(planear && pg) openTareasLoteModal({solicitud: STATE.solicitudes.find(x=>x.id===s.id) || s, proyecto: pg});
  };
}

// Crea varias tareas de una vez, cada una con su fecha. Sirve para planear un proyecto semana a semana,
// para convertir una solicitud en varias tareas, o para agregar más tareas a algo ya convertido.
function openTareasLoteModal(opts){
  const s = opts.solicitud || null;
  const fijo = opts.proyecto || null;
  const descripcion = s ? [s.descripcion, `Solicitado por: ${esc(s.area_solicitante)}${esc(s.nombre_solicitante?' ('+s.nombre_solicitante+')':'')}`].filter(Boolean).join('\n\n') : '';
  const material = (s && (s.archivo_url || s.links_referencia))
    ? {material_url: s.archivo_url || null, material_nombre: s.archivo_nombre || null, material_links: s.links_referencia || null} : {};
  const hayMaterial = !!(material.material_url || material.material_links);
  const rango = fijo ? rangoProyecto(fijo) : null;
  const f0 = (s && s.fecha_necesaria && (!rango || (s.fecha_necesaria>=rango.ini && s.fecha_necesaria<=rango.fin))) ? s.fecha_necesaria : (rango ? rango.ini : '');
  // En un proyecto, la primera fila parte de hoy (o del inicio si es futuro) y cada una sugiere una semana después sin pasar del fin del proyecto.
  const tope = d=> (rango && d > rango.fin) ? rango.fin : d;
  const base = rango ? tope(rango.ini < hoyStr() ? hoyStr() : rango.ini) : f0;
  const fechaFila = i=> rango ? tope(sumarDias(base, 7*i)) : f0;
  let filas = fijo
    ? [{titulo:'', fecha:fechaFila(0), talento:''}, {titulo:'', fecha:fechaFila(1), talento:''}, {titulo:'', fecha:fechaFila(2), talento:''}]
    : [{titulo:s?s.asunto:'', fecha:f0, talento:''}, {titulo:'', fecha:f0, talento:''}];
  const opcionesTalento = f=> `<option value="">Sin asignar</option>${STATE.talentos.map(t=>`<option value="${t.id}" ${f.talento===t.id?'selected':''}>${esc(t.nombre)}</option>`).join('')}`;
  const overlay = el(`
    <div class="modal-overlay"><div class="modal wide">
      <h3>${fijo?`Tareas de «${esc(fijo.nombre)}»`:'Convertir en varias tareas'}</h3>
      <p class="hint" style="margin-top:-8px;">${fijo?`Proyecto del ${textoRango(rango)}. Cada fila sugiere una semana después, sin pasar del fin del proyecto; puedes cambiar cualquier fecha.`:'Cada tarea tiene su propio título, fecha y responsable.'}${hayMaterial?' El material de la solicitud (archivo y links) se adjunta a cada tarea.':''}</p>
      ${fijo?'':`<div class="field"><label>Proyecto (opcional)</label>
        <select id="m-proyecto"><option value="">— Sin proyecto —</option>${STATE.proyectos.map(p=>`<option value="${p.id}">${esc(p.nombre)}</option>`).join('')}</select></div>`}
      <div class="lote-scroll"><div id="filas-multi"></div></div>
      <button type="button" class="btn secondary small" id="add-fila" style="margin-top:6px;">+ Agregar otra tarea</button>
      <div class="modal-actions">
        <button class="btn secondary" id="cancel">Cancelar</button>
        <button class="btn" id="crear-todas">Crear tareas</button>
      </div>
    </div></div>`);
  document.body.appendChild(overlay);
  const cont = $('#filas-multi', overlay);
  const conProyecto = ()=> !!fijo || !!($('#m-proyecto', overlay) && $('#m-proyecto', overlay).value);
  function renderFilas(){
    cont.innerHTML = `<div class="lote-head"><span>Título</span><span>Entrega</span><span>Asignar a</span><span></span></div>` + filas.map((f,i)=>`
      <div class="lote-row">
        <input class="multi-titulo" data-i="${i}" value="${esc(f.titulo)}" placeholder="Título de la tarea">
        <input type="date" class="multi-fecha" data-i="${i}" value="${f.fecha||''}">
        <select class="multi-talento" data-i="${i}">${opcionesTalento(f)}</select>
        <button type="button" class="btn secondary multi-quitar" data-i="${i}" aria-label="Quitar esta tarea">×</button>
      </div>`).join('');
    cont.querySelectorAll('.multi-titulo').forEach(x=> x.oninput = e=> filas[+e.target.dataset.i].titulo = e.target.value);
    cont.querySelectorAll('.multi-fecha').forEach(x=> x.onchange = e=> filas[+e.target.dataset.i].fecha = e.target.value);
    cont.querySelectorAll('.multi-talento').forEach(x=> x.onchange = e=> filas[+e.target.dataset.i].talento = e.target.value);
    cont.querySelectorAll('.multi-quitar').forEach(x=> x.onclick = e=>{ if(filas.length>1){ filas.splice(+e.currentTarget.dataset.i,1); renderFilas(); } });
  }
  renderFilas();
  $('#add-fila', overlay).onclick = ()=>{
    const ult = filas[filas.length-1];
    filas.push({titulo:'', fecha: fijo ? tope(sumarDias(ult.fecha||base, 7)) : (conProyecto() ? sumarDias(ult.fecha||f0, 7) : (ult.fecha||f0)), talento: ult.talento});
    renderFilas();
    const inputs = cont.querySelectorAll('.multi-titulo'); if(inputs.length) inputs[inputs.length-1].focus();
  };
  $('#cancel', overlay).onclick = ()=> overlay.remove();
  $('#crear-todas', overlay).onclick = async ()=>{
    const validas = filas.filter(f=>f.titulo.trim());
    if(validas.length===0){ toast('Agrega al menos un título'); return; }
    const proyecto_id = fijo ? fijo.id : (($('#m-proyecto', overlay) && $('#m-proyecto', overlay).value) || null);
    const rows = validas.map(f=>({
      titulo: f.titulo.trim(), descripcion, proyecto_id, tipo: s ? s.tipo : '',
      talento_id: f.talento || null, fecha_entrega: f.fecha || null,
      prioridad: s ? s.prioridad : 'media', estado: 'pendiente',
      ...(s ? {solicitud_id: s.id} : {}), ...material
    }));
    const { data, error } = await supa.from('tareas').insert(rows).select();
    if(error || !data || data.length===0){
      toast('No se pudieron crear las tareas' + (error ? ': '+error.message : '') + (s || hayMaterial ? '. ¿Ya corriste la migración v6 en Supabase?' : ''));
      return;
    }
    if(s){
      const cambios = {};
      if(s.estado!=='convertida'){ cambios.estado = 'convertida'; cambios.updated_at = new Date().toISOString(); }
      if(!s.tarea_id) cambios.tarea_id = data[0].id;
      if(proyecto_id && !s.proyecto_id) cambios.proyecto_id = proyecto_id;
      if(Object.keys(cambios).length) await supa.from('solicitudes').update(cambios).eq('id', s.id);
    }
    overlay.remove();
    await loadAll(); renderAdminTab();
    const pn = proyecto_id ? (STATE.proyectos.find(p=>p.id===proyecto_id) || {}).nombre : null;
    toast(`${data.length} tarea${data.length===1?'':'s'} creada${data.length===1?'':'s'}${pn?` en «${pn}»`:''}`);
  };
}
function openConvertirMultiModal(s){ openTareasLoteModal({solicitud:s}); }

/* ============================================================
   VISTA SOLICITAR (formulario público para otras áreas)
   ============================================================ */
function renderSolicitarView(){
  $('#app').innerHTML = `
    <div class="topbar">
      <div class="brand">${logoHTML(30)}<div class="sub">Solicitar tarea al equipo creativo</div></div>
      <div class="topbar-actions">${themeToggleHTML()}</div>
    </div>
    <div class="solicitud-wrap">
      <h1 class="form-title">Solicitar un trabajo</h1>
      <p class="form-lead">Completa este formulario para pedir una pieza, diseño, video u otro material al equipo creativo. Tu solicitud será revisada y asignada.</p>
      <div id="solicitud-form">
        <div class="field-row">
        <div class="field"><label>Área o persona que solicita *</label><input id="s-area" placeholder="Ej. Mercadeo, Tienda Cali"></div>
        <div class="field"><label>Tu nombre (opcional)</label><input id="s-nombre"></div>
        </div>
        <div class="field"><label>Asunto *</label><input id="s-asunto" placeholder="¿Qué necesitas?"></div>
        <div class="field"><label>Descripción</label><textarea id="s-desc" placeholder="Cuéntanos con detalle qué necesitas, para qué es, contexto importante..."></textarea></div>
        <div class="field-row">
        <div class="field"><label>Tipo</label><input id="s-tipo" placeholder="Diseño, video, pauta..."></div>
        <div class="field"><label>Prioridad</label>
          <select id="s-prioridad">${PRIORIDADES.map(p=>`<option value="${p}" ${p==='media'?'selected':''}>${p}</option>`).join('')}</select>
        </div>
        </div>
        <div class="field-row">
        <div class="field"><label>Fecha en que lo necesitas</label><input type="date" id="s-fecha"></div>
        <div class="field"><label>Hora (opcional)</label><input type="time" id="s-hora"></div>
        </div>
        <div class="field"><label>Links de referencia (opcional, uno por línea)</label><textarea id="s-links" placeholder="https://..."></textarea></div>
        <div class="field"><label>O adjunta un archivo de referencia (opcional, máx. 50 MB)</label><input type="file" id="s-archivo"><div style="font-size:11px;color:var(--text-dim);margin-top:4px;">Para videos pesados, sube el archivo a Drive o WeTransfer y pega el link arriba.</div></div>
        <button class="btn" id="btn-enviar-solicitud" style="width:100%;">Enviar solicitud</button>
        <div id="s-error" style="color:var(--danger);font-size:12px;margin-top:8px;"></div>
      </div>
    </div>`;

  $('#btn-enviar-solicitud').onclick = async ()=>{
    const area = $('#s-area').value.trim();
    const asunto = $('#s-asunto').value.trim();
    if(!area || !asunto){ $('#s-error').textContent = 'El área y el asunto son obligatorios.'; return; }
    const file = $('#s-archivo').files[0];
    const MAX_MB = 50;
    if(file && file.size > MAX_MB*1024*1024){
      $('#s-error').textContent = `El archivo pesa ${Math.round(file.size/1048576)} MB y el máximo es ${MAX_MB} MB. Sube el archivo a Drive o WeTransfer y pega el link en "Links de referencia".`;
      return;
    }
    const btn = $('#btn-enviar-solicitud'); btn.disabled = true; btn.textContent = 'Enviando...';
    $('#s-error').textContent = '';
    let archivo_url = null, archivo_nombre = null;
    if(file){
      try{
        const path = `solicitudes/${Date.now()}_${file.name}`;
        const { error: upErr } = await supa.storage.from(BUCKET_ARCHIVOS).upload(path, file);
        if(upErr) throw upErr;
        const { data: pub } = supa.storage.from(BUCKET_ARCHIVOS).getPublicUrl(path);
        archivo_url = pub.publicUrl;
        archivo_nombre = file.name;
      }catch(e){
        // No se envía la solicitud sin su archivo: quien solicita debe saber que no subió.
        $('#s-error').textContent = 'No se pudo subir el archivo, así que la solicitud NO se envió. Intenta de nuevo o pega un link en "Links de referencia".';
        btn.disabled = false; btn.textContent = 'Enviar solicitud';
        return;
      }
    }
    const payload = {
      area_solicitante: area,
      nombre_solicitante: $('#s-nombre').value.trim(),
      asunto,
      descripcion: $('#s-desc').value.trim(),
      tipo: $('#s-tipo').value.trim(),
      fecha_necesaria: $('#s-fecha').value || null,
      hora_necesaria: $('#s-hora').value || null,
      prioridad: $('#s-prioridad').value,
      links_referencia: $('#s-links').value.trim(),
      archivo_url, archivo_nombre,
      estado: 'pendiente'
    };
    const { error } = await supa.from('solicitudes').insert(payload);
    if(error){
      $('#s-error').textContent = 'No se pudo enviar. Intenta de nuevo en un momento.';
      btn.disabled = false; btn.textContent = 'Enviar solicitud';
      return;
    }
    $('.solicitud-wrap').innerHTML = `
      <div class="solicitud-success">
        <div class="check">${ico('check','')}</div>
        <h2>Solicitud enviada</h2>
        <p style="color:var(--text-dim);font-size:13px;margin-top:8px;">El equipo creativo la revisará pronto.</p>
        <button class="btn secondary" style="margin-top:20px;" id="btn-otra">Enviar otra solicitud</button>
      </div>`;
    $('#btn-otra').onclick = renderSolicitarView;
  };
}

/* ============================================================
   VISTA APRENDIZ (el módulo de abajo la reemplaza: mueve sus tareas con su clave)
   ============================================================ */
/* ============================================================
   VISTA JEFE (solo lectura, dashboard completo)
   ============================================================ */
function renderJefeVista(){
  $('#app').innerHTML = `
    <div class="topbar">
      <div class="brand">${logoHTML(30)}<div class="sub">Equipo Creativo</div></div>
      <div class="topbar-actions">${themeToggleHTML()}<span class="mode-badge">Vista dirección</span></div>
    </div>
    <main>
      <span class="readonly-badge">${ico('lock')} Solo lectura</span>
      <div class="page-title">Equipo creativo <span class="page-sub">${new Date().toLocaleDateString('es-CO',{weekday:'long', day:'numeric', month:'long'})}</span></div>
      <div class="grid-cards" id="jefe-cards"></div>
      <div class="charts-grid">
        <div class="chart-box"><h3>Carga por persona</h3><div class="chart-canvas"><canvas id="chart-carga-jefe"></canvas></div></div>
        <div class="chart-box"><h3>Distribución por estado</h3><div class="chart-canvas"><canvas id="chart-estado-jefe"></canvas></div></div>
      </div>
      <div class="chart-box" style="margin-bottom:24px;"><h3>Tendencia de tareas completadas</h3><div class="chart-canvas"><canvas id="chart-tendencia-jefe"></canvas></div></div>
      <div class="section-title">Equipo</div>
      <div id="jefe-talentos"></div>
      <div class="section-title">Tablero</div>
      <div id="jefe-kanban-controls"></div>
      <div class="kanban" id="jefe-kanban"></div>
      <div class="section-title">Tareas por semana</div>
      <div id="jefe-semana"></div>
    </main>`;

  renderDashboardCards('#jefe-cards');
  renderCharts('chart-carga-jefe','chart-estado-jefe','chart-tendencia-jefe');
  renderTalentosResumen('#jefe-talentos');
  renderKanban('#jefe-kanban', false);
  renderSemana('#jefe-semana', false);
}

/* ============================================================
   PIEZAS COMPARTIDAS: dashboard cards, charts, talentos, kanban
   ============================================================ */
function renderDashboardCards(sel){
  const proyectosActivos = STATE.proyectos.filter(p=>p.estado==='en_curso'||p.estado==='en_revision').length;
  const tareasActivas = STATE.tareas.filter(t=>t.estado!=='completada').length;
  const tareasAtrasadas = STATE.tareas.filter(isAtrasada).length;
  const completadas = STATE.tareas.filter(t=>t.estado==='completada');
  let cumplGeneral = '—';
  if(completadas.length>0){
    const aTiempo = completadas.filter(t=> !t.fecha_entrega || (entregaRealDe(t) || new Date(t.updated_at)) <= new Date(t.fecha_entrega+'T23:59:59'));
    cumplGeneral = Math.round((aTiempo.length/completadas.length)*100)+'%';
  }
  let mayorNombre = '—', mayorN = 0;
  if(STATE.talentos.length){
    const withLoad = STATE.talentos.map(t=>({t, n:tareasActivasDe(t.id).length})).sort((a,b)=>b.n-a.n);
    if(withLoad[0] && withLoad[0].n>0){ mayorNombre = withLoad[0].t.nombre; mayorN = withLoad[0].n; }
  }
  const sobrecargados = STATE.talentos.filter(t=> nivelCarga(t.id).cls==='danger');
  const pendientesSolicitud = STATE.solicitudes.filter(s=>s.estado==='pendiente').length;
  const bannerSolicitudes = (pendientesSolicitud>0 && STATE.mode==='admin')
    ? `<div class="alert-banner" id="banner-solicitudes" role="button" tabindex="0">${pendientesSolicitud} solicitud${pendientesSolicitud===1?'':'es'} nueva${pendientesSolicitud===1?'':'s'} de otras áreas por revisar<span class="go">Ver solicitudes</span></div>`
    : '';
  const banner = sobrecargados.length
    ? `<div class="alert-banner is-danger">${sobrecargados.length===1?'Una persona está':'Hay '+sobrecargados.length+' personas'} sobrecargada${sobrecargados.length===1?'':'s'}: ${esc(sobrecargados.map(t=>t.nombre).join(', '))}. Considera redistribuir tareas.</div>`
    : '';
  const vencenPronto = STATE.tareas.filter(t=> !isAtrasada(t) && t.estado!=='completada' && diasParaVencer(t)!==null && diasParaVencer(t)<=DIAS_ALERTA_VENCIMIENTO && diasParaVencer(t)>=0).length;
  const bannerVence = vencenPronto>0
    ? `<div class="alert-banner is-warn">${vencenPronto} tarea${vencenPronto===1?'':'s'} vence${vencenPronto===1?'':'n'} en los próximos ${DIAS_ALERTA_VENCIMIENTO} días.</div>`
    : '';
  const kpi = (icono, label, valor, sub, extra)=> `<div class="card ${extra&&extra.cls||''}"><div class="label"><span class="kpi-ico">${ico(icono)}</span>${label}</div><div class="value ${extra&&extra.val||''}"${extra&&extra.style?` style="${extra.style}"`:''}>${valor}</div>${sub?`<div class="sub">${sub}</div>`:''}</div>`;
  $(sel).innerHTML =
    kpi('check','Cumplimiento general', cumplGeneral, completadas.length ? `${completadas.length} tarea${completadas.length===1?'':'s'} completada${completadas.length===1?'':'s'}` : 'Aún sin tareas completadas', {cls:'hero'}) +
    kpi('tareas','Tareas activas', tareasActivas, vencenPronto ? `${vencenPronto} vence${vencenPronto===1?'':'n'} pronto` : 'Sin vencimientos cercanos') +
    kpi('clock','Tareas atrasadas', tareasAtrasadas, tareasAtrasadas ? 'Necesitan atención' : 'Todo al día', {val: tareasAtrasadas>0?'danger':''}) +
    kpi('proyectos','Proyectos activos', proyectosActivos, `${STATE.proyectos.length} en total`) +
    kpi('talentos','Mayor carga', esc(mayorNombre), mayorN ? `${mayorN} tarea${mayorN===1?'':'s'} activa${mayorN===1?'':'s'}` : '', {style:'font-size:26px;line-height:1.2;letter-spacing:-.015em;'});
  const parent = $(sel).parentElement;
  const existing = parent.querySelector('.alert-banner-wrap');
  if(existing) existing.remove();
  if(banner || bannerVence || bannerSolicitudes){
    const wrap = el(`<div class="alert-banner-wrap">${bannerSolicitudes}${banner}${bannerVence}</div>`);
    parent.insertBefore(wrap, $(sel));
    const bs = $('#banner-solicitudes', wrap);
    if(bs){
      const ir = ()=>{ STATE.activeTab='solicitudes'; renderAdminTab(); };
      bs.onclick = ir;
      bs.onkeydown = e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); ir(); } };
    }
  }
}

function destroyChart(id){ if(STATE.charts[id]){ STATE.charts[id].destroy(); delete STATE.charts[id]; } }

// Los colores salen del tema activo (claro u oscuro) y los ejes cuentan en números enteros.
function temaGraficas(){
  const cs = getComputedStyle(document.documentElement);
  const v = n=>cs.getPropertyValue(n).trim();
  const oscuro = document.documentElement.getAttribute('data-theme')==='dark';
  if(window.Chart){ Chart.defaults.font.family = "'Jost', system-ui, sans-serif"; Chart.defaults.font.size = 12.5; Chart.defaults.color = v('--ink-2'); }
  return {
    ink:v('--ink'), ink2:v('--ink-2'), line:v('--line'), panel:v('--panel'), strong:v('--line-strong'),
    estados: oscuro ? ['#7a7a73','#e3b865','#8fb0d6','#4cc29a','#e88b83'] : ['#bdb8ab','#cfa34a','#7b97b8','#1f7a5a','#c9524a'],
    suave: oscuro ? 'rgba(76,194,154,.14)' : 'rgba(31,122,90,.12)',
    verde: oscuro ? '#4cc29a' : '#1f7a5a', barra: oscuro ? '#e6e3da' : '#1d1c1a'
  };
}
function ejesGraficas(th, opts){
  opts = opts || {};
  return {
    x:{grid:{display:false}, border:{color:th.line}, ticks:{color:th.ink2}},
    y:{beginAtZero:true, border:{display:false}, grid:{color:th.line}, ticks:{color:th.ink2, precision:0, maxTicksLimit:5}, suggestedMax:opts.max}
  };
}

function renderCharts(idCarga, idEstado, idTendencia){
  destroyChart(idCarga); destroyChart(idEstado); destroyChart(idTendencia);
  const th = temaGraficas();

  const labels = STATE.talentos.map(t=>t.nombre);
  const data = STATE.talentos.map(t=>tareasActivasDe(t.id).length);
  STATE.charts[idCarga] = new Chart($('#'+idCarga), {
    type:'bar',
    data:{labels, datasets:[{label:'Tareas activas', data, backgroundColor:th.barra, borderRadius:10, borderSkipped:false, maxBarThickness:30}]},
    options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:ejesGraficas(th)}
  });

  const estados = ['pendiente','en_progreso','en_revision','completada'];
  const estadoLabels = ['Pendiente','En progreso','En revisión','Completada'];
  const atrasadasCount = STATE.tareas.filter(isAtrasada).length;
  const counts = estados.map(e=> STATE.tareas.filter(t=>t.estado===e && !isAtrasada(t)).length );
  STATE.charts[idEstado] = new Chart($('#'+idEstado), {
    type:'doughnut',
    data:{labels:[...estadoLabels,'Atrasada'], datasets:[{data:[...counts, atrasadasCount], backgroundColor:th.estados, borderColor:'transparent', borderWidth:0, spacing:3, borderRadius:6, hoverOffset:4}]},
    options:{responsive:true, maintainAspectRatio:false, cutout:'66%', plugins:{legend:{position:'right', labels:{usePointStyle:true, pointStyle:'circle', boxWidth:7, boxHeight:7, padding:12, color:th.ink2}}}}
  });

  // Tendencia: tareas completadas por semana (últimas 8 semanas) basado en updated_at
  const weeks = [];
  const now = new Date();
  for(let i=7;i>=0;i--){
    const d = new Date(now); d.setDate(d.getDate()-i*7);
    weeks.push(d);
  }
  const weekLabels = weeks.map(d=>`${d.getDate()}/${d.getMonth()+1}`);
  const weekCounts = weeks.map((d,i)=>{
    const start = new Date(d); start.setDate(start.getDate()-7);
    return STATE.tareas.filter(t=> t.estado==='completada' && new Date(t.updated_at) > start && new Date(t.updated_at) <= d).length;
  });
  STATE.charts[idTendencia] = new Chart($('#'+idTendencia), {
    type:'line',
    data:{labels:weekLabels, datasets:[{label:'Completadas', data:weekCounts, borderColor:th.verde, borderWidth:2.5, backgroundColor:th.suave, fill:true, tension:.35, pointRadius:0, pointHoverRadius:4, pointBackgroundColor:th.verde}]},
    options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, interaction:{intersect:false, mode:'index'}, scales:ejesGraficas(th)}
  });
}

function renderTalentosResumen(sel){
  const cont = $(sel);
  cont.innerHTML='';
  if(STATE.talentos.length===0){ cont.innerHTML = `<div class="empty-state">No hay talentos registrados.</div>`; return; }
  STATE.talentos.forEach(t=>{
    const carga = nivelCarga(t.id);
    const cumpl = cumplimientoDe(t.id);
    const tProm = tiempoPromedioEntrega(t.id);
    cont.appendChild(el(`
      <div class="list-row">
        <div class="avatar">${esc(t.avatar_inicial||initials(t.nombre))}</div>
        <div class="flex-grow">
          <div class="person-name">${esc(t.nombre)}</div>
          <div class="person-role">${esc(t.rol)}</div>
        </div>
        <span class="pill dim">${t.estado}</span>
        <span class="pill ${carga.cls}">${carga.label} (${carga.n})</span>
        <span class="pill dim">Cumpl: ${cumpl===null?'—':cumpl+'%'}</span>
        <span class="pill dim">${labelTiempoPromedio(tProm)}</span>
      </div>`));
  });
}

/* ============================================================
   TABLERO: VENTANA DE TIEMPO Y SEMANAS
   ============================================================ */
function ymd(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function hoyStr(){ return ymd(new Date()); }
function rangoSemana(offset){
  const hoy = new Date();
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  lunes.setDate(lunes.getDate() - ((lunes.getDay()+6)%7) + 7*(offset||0));
  const domingo = new Date(lunes); domingo.setDate(domingo.getDate()+6);
  return {ini:ymd(lunes), fin:ymd(domingo), lunes, domingo};
}
// Fecha real en que se completó cada tarea: sale del historial automático de estados;
// si es una tarea antigua sin historial, se usa su última actualización.
function mapaFechasCompletada(){
  const m = {};
  STATE.avances.forEach(a=>{
    if(!a.descripcion || !a.descripcion.startsWith('Estado cambiado:') || !/→ Completada\s*$/.test(a.descripcion)) return;
    const d = new Date(a.created_at);
    if(!m[a.tarea_id] || d > m[a.tarea_id]) m[a.tarea_id] = d;
  });
  return m;
}
function fechaCompletadaStr(t, mapa){
  const d = mapa[t.id] || (t.updated_at ? new Date(t.updated_at) : null);
  return d ? ymd(d) : '';
}
function fechaPlanificada(t){ return t.fecha_entrega || (t.created_at ? ymd(new Date(t.created_at)) : ''); }
function visibleEnTablero(t, vista, ctx){
  if(vista==='todas') return true;
  if(t.estado==='completada'){
    const c = fechaCompletadaStr(t, ctx.mapa);
    return vista==='hoy' ? c===ctx.hoy : (c>=ctx.rango.ini && c<=ctx.rango.fin);
  }
  if(!t.fecha_entrega) return true;            // sin fecha: siempre visible
  if(t.estado!=='pendiente') return true;      // en progreso, en revisión o bloqueada: trabajo en curso
  const limite = vista==='hoy' ? ctx.hoy : ctx.rango.fin;
  return t.fecha_entrega <= limite;            // pendientes: vencen hoy/esta semana o ya están atrasadas
}
function textoVistaTablero(){
  return {
    hoy:'Vence hoy o está atrasado, más lo que está en progreso o en revisión y lo completado hoy.',
    semana:'Vence esta semana o está atrasado, más lo que está en curso y lo completado esta semana.',
    todas:'Todas las tareas, incluso las completadas en semanas anteriores.'
  }[STATE.vistaTablero];
}
function renderControlesTablero(sel, editable, ocultas){
  const ctrl = document.querySelector(sel+'-controls');
  if(!ctrl) return;
  const opciones = [['hoy','Hoy'],['semana','Esta semana'],['todas','Todas']];
  const aviso = (ocultas>0 && STATE.vistaTablero!=='todas')
    ? ` · <a href="#" id="ver-proximas">${ocultas} tarea${ocultas===1?'':'s'} próxima${ocultas===1?'':'s'} oculta${ocultas===1?'':'s'} (ver todas)</a>` : '';
  ctrl.innerHTML = `
    <div class="chips">${opciones.map(([k,l])=>`<button class="chip ${STATE.vistaTablero===k?'active':''}" data-vista="${k}">${l}</button>`).join('')}</div>
    <div class="hint">${textoVistaTablero()}${aviso}</div>`;
  const cambiar = v=>{ STATE.vistaTablero = v; try{ localStorage.setItem('equipo_vista_tablero', v); }catch(e){} renderKanban(sel, editable); };
  ctrl.querySelectorAll('[data-vista]').forEach(b=> b.onclick = ()=> cambiar(b.dataset.vista));
  const ver = ctrl.querySelector('#ver-proximas');
  if(ver) ver.onclick = e=>{ e.preventDefault(); cambiar('todas'); };
}

function renderKanban(sel, editable){
  const cont = $(sel);
  cont.innerHTML='';
  const vista = STATE.vistaTablero;
  const ctx = {hoy:hoyStr(), rango:rangoSemana(0), mapa:mapaFechasCompletada()};
  const visibles = STATE.tareas.filter(t=>visibleEnTablero(t, vista, ctx));
  const ocultasProximas = STATE.tareas.filter(t=>t.estado!=='completada' && !visibleEnTablero(t, vista, ctx)).length;
  renderControlesTablero(sel, editable, ocultasProximas);
  const labelCompletada = vista==='hoy' ? 'Completadas hoy' : vista==='semana' ? 'Completadas esta semana' : 'Completada';
  const orden = (a,b)=> (a.fecha_entrega||'9999-12-31').localeCompare(b.fecha_entrega||'9999-12-31');
  ESTADOS_TAREA.forEach(col=>{
    const items = visibles.filter(t=>t.estado===col.key).sort(orden);
    const labelCol = col.key==='completada' ? labelCompletada : col.label;
    const colEl = el(`<div class="kanban-col" data-estado="${col.key}"><h4>${labelCol} <span>${items.length}</span></h4><div class="kcards"></div></div>`);
    const kcards = $('.kcards', colEl);
    items.forEach(t=>{
      const proy = STATE.proyectos.find(p=>p.id===t.proyecto_id);
      const colorMarca = proy && proy.color ? colorSeguro(proy.color) : 'transparent';
      const tn = t.talento_id ? talentoNombre(t.talento_id) : null;
      const flags = [];
      if(isAtrasada(t)) flags.push('<span class="pill danger">Atrasada</span>');
      else { const v = pillVencimiento(t); if(v) flags.push(v); }
      if(t.prioridad==='urgente' || t.prioridad==='alta') flags.push(pillPrioridad(t.prioridad));
      const quien = editable
        ? `<span class="mini-av">${tn?esc(initials(tn)):'·'}</span><select class="reassign" data-id="${t.id}" aria-label="Asignar tarea"><option value="">Sin asignar</option>${STATE.talentos.map(tl=>`<option value="${tl.id}" ${tl.id===t.talento_id?'selected':''}>${esc(tl.nombre)}</option>`).join('')}</select>`
        : `<span class="mini-av">${tn?esc(initials(tn)):'·'}</span><span>${tn?esc(tn):'Sin asignar'}</span>`;
      const card = el(`
        <div class="kcard" draggable="${editable}" data-id="${t.id}" style="border-left:3px solid ${colorMarca};">
          <div class="t">${esc(t.titulo)}</div>
          <div class="kmeta"><span class="kdue ${isAtrasada(t)?'late':''}">${fmtCorta(t.fecha_entrega)}</span>${flags.join('')}</div>
          ${selloKanban(t)}
          <div class="kfoot">${quien}</div>
        </div>`);
      if(editable){
        card.addEventListener('dragstart', e=>{ card.classList.add('dragging'); e.dataTransfer.setData('text/plain', t.id); });
        card.addEventListener('dragend', ()=> card.classList.remove('dragging'));
        card.querySelector('.t').addEventListener('click', ()=> openTareaModal(t.id));
        const sel = card.querySelector('.reassign');
        sel.addEventListener('click', e=> e.stopPropagation());
        sel.addEventListener('change', async e=>{
          e.stopPropagation();
          await supa.from('tareas').update({talento_id: sel.value || null, updated_at:new Date().toISOString()}).eq('id', t.id);
          await loadAll(); renderAdminTab();
          toast('Tarea reasignada');
        });
      }
      kcards.appendChild(card);
    });
    if(editable){
      colEl.addEventListener('dragover', e=>{ e.preventDefault(); colEl.classList.add('dragover'); });
      colEl.addEventListener('dragleave', ()=> colEl.classList.remove('dragover'));
      colEl.addEventListener('drop', async e=>{
        e.preventDefault(); colEl.classList.remove('dragover');
        const id = e.dataTransfer.getData('text/plain');
        const tareaAntes = STATE.tareas.find(x=>x.id===id);
        const estadoAnterior = tareaAntes ? tareaAntes.estado : null;
        if(col.key==='completada' && estadoAnterior!=='completada'){ abrirAprobacion(id); return; }
        await supa.from('tareas').update({estado:col.key, updated_at:new Date().toISOString()}).eq('id', id);
        await registrarCambioEstado(id, estadoAnterior, col.key);
        await loadAll(); renderAdminTab();
        toast('Tarea actualizada');
      });
    }
    cont.appendChild(colEl);
  });
}

/* ============================================================
   TAREAS POR SEMANA (historial, también en vista de dirección)
   ============================================================ */
function renderAdminSemanas(){
  $('#view-semanas').innerHTML = `<div class="section-title">Tareas por semana</div><div id="semana-cont"></div>`;
  renderSemana('#semana-cont', true);
}

function renderSemana(sel, editable){
  const cont = $(sel);
  if(!cont) return;
  const r = rangoSemana(STATE.semanaOffset);
  const hoy = hoyStr();
  const enSemana = STATE.tareas
    .filter(t=>{ const f = fechaPlanificada(t); return f>=r.ini && f<=r.fin; })
    .filter(t=> !STATE.semanaTalento || t.talento_id===STATE.semanaTalento);
  const total = enSemana.length;
  const completadas = enSemana.filter(t=>t.estado==='completada').length;
  const atrasadas = enSemana.filter(isAtrasada).length;
  const porHacer = total - completadas - atrasadas;
  const avance = total ? Math.round((completadas/total)*100) : 0;
  const f = d=> d.toLocaleDateString('es-CO',{day:'numeric', month:'short'});
  const titulo = `${f(r.lunes)} – ${f(r.domingo)} de ${r.domingo.getFullYear()}`;
  const previas = STATE.semanaOffset===0
    ? STATE.tareas.filter(t=>isAtrasada(t) && fechaPlanificada(t) < r.ini && (!STATE.semanaTalento || t.talento_id===STATE.semanaTalento)).length : 0;
  const avisoPrevias = previas>0
    ? `<div class="alert-banner is-danger">${previas} tarea${previas===1?'':'s'} atrasada${previas===1?'':'s'} de semanas anteriores sigue${previas===1?'':'n'} abierta${previas===1?'':'s'} y se ve${previas===1?'':'n'} en el tablero.</div>` : '';

  const dias = [];
  for(let i=0;i<7;i++){ const d = new Date(r.lunes); d.setDate(d.getDate()+i); dias.push(ymd(d)); }
  const orden = t=> PRIORIDADES.indexOf(t.prioridad);

  cont.innerHTML = `
    <div class="week-nav">
      <button class="btn secondary small" id="sem-prev">‹ Anterior</button>
      <h3>${STATE.semanaOffset===0?'Esta semana · ':''}${titulo}</h3>
      <button class="btn secondary small" id="sem-hoy">Esta semana</button>
      <button class="btn secondary small" id="sem-next">Siguiente ›</button>
    </div>
    <div class="filtros">
      <select id="sem-talento"><option value="">Todo el equipo</option>${STATE.talentos.map(t=>`<option value="${t.id}" ${STATE.semanaTalento===t.id?'selected':''}>${esc(t.nombre)}</option>`).join('')}</select>
    </div>
    <div class="grid-cards">
      <div class="card"><div class="label">Tareas de la semana</div><div class="value">${total}</div></div>
      <div class="card"><div class="label">Completadas</div><div class="value gold">${completadas}</div></div>
      <div class="card"><div class="label">Por hacer</div><div class="value">${porHacer}</div></div>
      <div class="card"><div class="label">Atrasadas</div><div class="value ${atrasadas>0?'danger':''}">${atrasadas}</div></div>
      <div class="card"><div class="label">Avance</div><div class="value">${avance}%</div><div class="progress-bar"><div class="progress-fill" style="width:${avance}%"></div></div></div>
    </div>
    ${avisoPrevias}
    <div id="sem-dias"></div>`;

  $('#sem-prev', cont).onclick = ()=>{ STATE.semanaOffset--; renderSemana(sel, editable); };
  $('#sem-next', cont).onclick = ()=>{ STATE.semanaOffset++; renderSemana(sel, editable); };
  $('#sem-hoy', cont).onclick = ()=>{ STATE.semanaOffset = 0; renderSemana(sel, editable); };
  $('#sem-talento', cont).onchange = e=>{ STATE.semanaTalento = e.target.value; renderSemana(sel, editable); };

  const lista = $('#sem-dias', cont);
  if(total===0){ lista.innerHTML = `<div class="empty-state">No hay tareas para esta semana.</div>`; return; }
  dias.forEach(dia=>{
    const delDia = enSemana.filter(t=>fechaPlanificada(t)===dia).sort((a,b)=> orden(b)-orden(a));
    if(delDia.length===0) return;
    const nombre = new Date(dia+'T00:00:00').toLocaleDateString('es-CO',{weekday:'long', day:'numeric', month:'short'});
    lista.appendChild(el(`<div class="day-head"><span class="dname">${nombre}</span>${dia===hoy?' <span class="pill warn">Hoy</span>':''}<span class="count">${delDia.length} tarea${delDia.length===1?'':'s'}</span></div>`));
    delDia.forEach(t=>{
      const proy = STATE.proyectos.find(p=>p.id===t.proyecto_id);
      const colorMarca = proy && proy.color ? colorSeguro(proy.color) : null;
      const row = el(`
        <div class="list-row" style="align-items:flex-start;${colorMarca?`border-left:3px solid ${colorMarca};`:''}">
          <div class="flex-grow">
            <div class="person-name">${esc(t.titulo)}</div>
            <div class="person-role">${esc(proy?proy.nombre:'Sin proyecto')} · ${esc(talentoNombre(t.talento_id))}</div>
            <div class="meta" style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">${pillEstadoTarea(t)} ${pillVencimiento(t)} ${pillPrioridad(t.prioridad)}${t.fecha_entrega?'':' <span class="pill dim">Sin fecha de entrega</span>'}${t.link_archivo?` <a href="${esc(urlSegura(t.link_archivo)||'#')}" rel="noopener" target="_blank" class="pill ok">Ver archivo</a>`:''}</div>
          </div>
          ${editable?`<div class="row-actions"><button class="btn secondary small" data-abrir="${t.id}">Abrir</button></div>`:''}
        </div>`);
      lista.appendChild(row);
    });
  });
  lista.querySelectorAll('[data-abrir]').forEach(b=> b.onclick = ()=> openTareaModal(b.dataset.abrir));
}

/* ============================================================
   CALENDARIO MENSUAL
   ============================================================ */
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }

// Solo se permiten links http/https: cualquier otra cosa (p. ej. "javascript:") se muestra como texto, nunca como link.
function urlSegura(u){
  u = String(u||'').trim();
  if(/^https?:\/\//i.test(u)) return u;
  if(/^www\./i.test(u)) return 'https://'+u;
  return '';
}
function listaLinks(texto){ return String(texto||'').split('\n').map(l=>l.trim()).filter(Boolean); }
function materialDeTarea(t){ return {url:t.material_url, nombre:t.material_nombre, links:t.material_links}; }
function materialHTML(m, titulo){
  const links = listaLinks(m.links);
  const urlArchivo = urlSegura(m.url);
  if(!urlArchivo && links.length===0) return '';
  const archivo = urlArchivo ? `<div class="material-row"><a href="${esc(urlArchivo)}" target="_blank" rel="noopener" class="pill ok">${ico('clip')} ${esc(m.nombre||'Abrir archivo')}</a></div>` : '';
  const enlaces = links.map(l=>{
    const u = urlSegura(l);
    return `<div class="material-row">${u?`<a href="${esc(u)}" target="_blank" rel="noopener">${ico('link')}${esc(l)}</a>`:`<span>${esc(l)}</span>`}</div>`;
  }).join('');
  return `<div class="material-box"><div class="material-title">${esc(titulo||'Material para trabajar')}</div>${archivo}${enlaces}</div>`;
}

function renderCalendarioMes(){
  const view = $('#view-calendario');
  const year = STATE.calFecha.getFullYear();
  const month = STATE.calFecha.getMonth();
  const nombreMes = STATE.calFecha.toLocaleDateString('es-CO',{month:'long', year:'numeric'});
  const primerDia = new Date(year, month, 1).getDay();
  const diasEnMes = new Date(year, month+1, 0).getDate();
  const hoy = new Date();

  let celdas = '';
  for(let i=0;i<primerDia;i++) celdas += `<div class="cal-cell empty"></div>`;
  for(let d=1; d<=diasEnMes; d++){
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const tareasDia = STATE.tareas.filter(t=>t.fecha_entrega===dateStr)
      .sort((a,b)=> (a.estado==='completada')-(b.estado==='completada') || PRIORIDADES.indexOf(b.prioridad)-PRIORIDADES.indexOf(a.prioridad));
    const esHoy = hoy.getFullYear()===year && hoy.getMonth()===month && hoy.getDate()===d;
    const colorDe = t=>{ const p = STATE.proyectos.find(x=>x.id===t.proyecto_id); return colorSeguro(p && p.color); };
    const visibles = tareasDia.slice(0,3), extra = tareasDia.length - visibles.length;
    const chips = visibles.map(t=>{
      const cls = t.estado==='completada' ? 'done' : (isAtrasada(t) ? 'late' : '');
      return `<span class="cal-task ${cls}" data-open-cal="${t.id}" style="border-left-color:${colorDe(t)};" title="${esc(t.titulo+' · '+talentoNombre(t.talento_id))}">${esc(t.titulo)}</span>`;
    }).join('');
    const dots = tareasDia.map(t=>`<i class="cal-dot" style="background:${colorDe(t)};"></i>`).join('');
    celdas += `<div class="cal-cell ${esHoy?'today':''}" data-date="${dateStr}">
      <div class="num">${d}</div>
      ${tareasDia.length? `<div class="cal-tasks">${chips}${extra>0?`<div class="cal-more">+${extra} más</div>`:''}</div><div class="cal-dots">${dots}</div>`:''}
    </div>`;
  }

  view.innerHTML = `
    <div class="cal-header">
      <button class="btn secondary small" id="cal-prev">‹ Anterior</button>
      <h3>${nombreMes}</h3>
      <button class="btn secondary small" id="cal-next">Siguiente ›</button>
    </div>
    <div class="cal-grid">
      ${['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d=>`<div class="cal-daylabel">${d}</div>`).join('')}
      ${celdas}
    </div>
    <div id="cal-detalle" style="margin-top:20px;"></div>
  `;
  $('#cal-prev').onclick = ()=>{ STATE.calFecha = new Date(year, month-1, 1); renderCalendario(); };
  $('#cal-next').onclick = ()=>{ STATE.calFecha = new Date(year, month+1, 1); renderCalendario(); };
  view.querySelectorAll('[data-open-cal]').forEach(s=> s.addEventListener('click', e=>{ e.stopPropagation(); openTareaModal(s.dataset.openCal); }));
  view.querySelectorAll('.cal-cell[data-date]').forEach(cell=>{
    cell.addEventListener('click', ()=>{
      const date = cell.dataset.date;
      const tareasDia = STATE.tareas.filter(t=>t.fecha_entrega===date);
      const det = $('#cal-detalle');
      if(tareasDia.length===0){ det.innerHTML = `<div class="empty-state">Sin tareas para ${fmtDate(date)}.</div>`; return; }
      det.innerHTML = `<div class="section-title">Tareas del ${fmtDate(date)}</div>`;
      tareasDia.forEach(t=>{
        det.appendChild(el(`
          <div class="list-row">
            <div class="flex-grow">
              <div class="person-name">${esc(t.titulo)}</div>
              <div class="person-role">${esc(talentoNombre(t.talento_id))} · ${esc(proyectoNombre(t.proyecto_id))}${t.tipo?' · '+esc(t.tipo):''}</div>
            </div>
            ${pillEstadoTarea(t)}
            <button class="btn secondary small" data-open="${t.id}">Ver</button>
          </div>`));
      });
      det.querySelectorAll('[data-open]').forEach(b=> b.onclick = ()=> openTareaModal(b.dataset.open));
    });
  });
}

/* ============================================================
   VISTA ADMINISTRADOR
   ============================================================ */
function renderAdminDashboard(){
  const hoyLargo = new Date().toLocaleDateString('es-CO',{weekday:'long', day:'numeric', month:'long'});
  $('#view-dashboard').innerHTML = `
    <div class="section-title hello"><span class="hello-kicker">${hoyLargo}</span><h1>${saludoHora()}, ${esc(NOMBRE_ADMIN)}</h1><p class="hello-sub">${resumenDia()}</p></div>
    ${avisoRevision()}
    <div class="grid-cards" id="ad-cards"></div>
    <div class="charts-grid">
      <div class="chart-box"><h3>Carga por persona</h3><div class="chart-canvas"><canvas id="chart-carga-ad"></canvas></div></div>
      <div class="chart-box"><h3>Distribución por estado</h3><div class="chart-canvas"><canvas id="chart-estado-ad"></canvas></div></div>
    </div>
    <div class="chart-box" style="margin-bottom:24px;"><h3>Tendencia de tareas completadas</h3><div class="chart-canvas"><canvas id="chart-tendencia-ad"></canvas></div></div>
    <div class="section-title">Equipo</div>
    <div id="ad-talentos"></div>`;
  renderDashboardCards('#ad-cards');
  renderCharts('chart-carga-ad','chart-estado-ad','chart-tendencia-ad');
  renderTalentosResumen('#ad-talentos');
}

function renderAdminKanbanTab(){
  $('#view-kanban').innerHTML = `<div class="section-title">Tablero <button class="btn small" id="btn-nueva-tarea-kanban">+ Nueva tarea</button></div><div id="ad-kanban-controls"></div><div class="kanban" id="ad-kanban"></div>`;
  $('#btn-nueva-tarea-kanban').onclick = ()=> openTareaModal(null);
  renderKanban('#ad-kanban', true);
}

/* ---------------- TALENTOS ---------------- */
function renderAdminTalentos(){
  $('#view-talentos').innerHTML = `<div class="section-title">Talentos <button class="btn small" id="btn-nuevo-talento">+ Nuevo talento</button></div><div id="lista-talentos"></div>`;
  $('#btn-nuevo-talento').onclick = ()=> openTalentoModal(null);
  const cont = $('#lista-talentos');
  cont.innerHTML='';
  if(STATE.talentos.length===0){ cont.innerHTML=`<div class="empty-state">No hay talentos aún.</div>`; return; }
  STATE.talentos.forEach(t=>{
    const carga = nivelCarga(t.id);
    cont.appendChild(el(`
      <div class="list-row">
        <div class="avatar">${esc(t.avatar_inicial||initials(t.nombre))}</div>
        <div class="flex-grow">
          <div class="person-name">${esc(t.nombre)}</div>
          <div class="person-role">${esc(t.rol)}</div>
        </div>
        <span class="pill dim">${t.estado}</span>
        <span class="pill ${carga.cls}">${carga.label} (${carga.n})</span>
        ${t.acceso_habilitado===false?'<span class="pill danger">Acceso revocado</span>':''}
        ${pillClave(t)}
        <div class="row-actions">
          <button class="btn secondary small" data-clave="${t.id}">${ico('lock')} Clave</button>
          <button class="btn secondary small" data-edit="${t.id}">Editar</button>
          <button class="btn danger small" data-del="${t.id}">Eliminar</button>
        </div>
      </div>`));
  });
  cont.querySelectorAll('[data-edit]').forEach(b=> b.onclick = ()=> openTalentoModal(b.dataset.edit));
  cont.querySelectorAll('[data-clave]').forEach(b=> b.onclick = ()=> abrirModalClave(b.dataset.clave));
  cont.querySelectorAll('[data-del]').forEach(b=> b.onclick = ()=> deleteRow('talentos', b.dataset.del, renderAdminTalentos));
}

function openTalentoModal(id){
  const t = id ? STATE.talentos.find(x=>x.id===id) : null;
  const overlay = el(`
    <div class="modal-overlay">
      <div class="modal">
        <h3>${t?'Editar':'Nuevo'} talento</h3>
        <div class="field"><label>Nombre</label><input id="f-nombre" value="${esc(t?t.nombre:'')}"></div>
        <div class="field"><label>Rol</label><input id="f-rol" value="${esc(t?t.rol:'')}" placeholder="Diseño gráfico, fotografía, pauta..."></div>
        <div class="field"><label>Estado</label>
          <select id="f-estado">${ESTADOS_TALENTO.map(e=>`<option value="${e}" ${t&&t.estado===e?'selected':''}>${e}</option>`).join('')}</select>
        </div>
        ${t?`
        <div class="field">
          <label style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="f-acceso" ${t.acceso_habilitado!==false?'checked':''} style="width:auto;">
            Acceso a su link de vista habilitado
          </label>
        </div>`:''}
        <div class="modal-actions">
          <button class="btn secondary" id="cancel">Cancelar</button>
          <button class="btn" id="save">Guardar</button>
        </div>
      </div>
    </div>`);
  document.body.appendChild(overlay);
  $('#cancel', overlay).onclick = ()=> overlay.remove();
  $('#save', overlay).onclick = async ()=>{
    const nombre = $('#f-nombre', overlay).value.trim();
    const rol = $('#f-rol', overlay).value.trim();
    const estado = $('#f-estado', overlay).value;
    if(!nombre || !rol){ toast('Nombre y rol son obligatorios'); return; }
    const payload = { nombre, rol, estado, avatar_inicial: initials(nombre) };
    if(t){
      payload.acceso_habilitado = $('#f-acceso', overlay).checked;
      await supa.from('talentos').update(payload).eq('id', t.id);
      overlay.remove();
      await loadAll(); renderAdminTalentos();
      toast('Talento guardado');
    } else {
      const { data, error } = await supa.from('talentos').insert(payload).select();
      overlay.remove();
      await loadAll(); renderAdminTalentos();
      if(!error && data && data[0]){
        mostrarLinkGenerado(data[0]);
      } else {
        toast('Talento guardado');
      }
    }
  };
}

function mostrarLinkGenerado(talento){
  const base = location.origin + location.pathname;
  const link = `${base}?aprendiz=${talento.id}`;
  const overlay = el(`
    <div class="modal-overlay">
      <div class="modal">
        <h3>${esc(talento.nombre)} — link de acceso listo</h3>
        <p style="font-size:13px;color:var(--text-dim);margin-bottom:12px;">Comparte este link para que vea sus tareas y las mueva por etapas. Luego créale su clave de 4 dígitos en Talentos → Clave:</p>
        <div class="field"><input id="nuevo-link" value="${link}" readonly></div>
        <div class="modal-actions">
          <button class="btn secondary" id="close-link">Cerrar</button>
          <button class="btn" id="copy-nuevo-link">Copiar link</button>
        </div>
      </div>
    </div>`);
  document.body.appendChild(overlay);
  $('#close-link', overlay).onclick = ()=> overlay.remove();
  $('#copy-nuevo-link', overlay).onclick = ()=>{ navigator.clipboard.writeText(link); toast('Link copiado'); overlay.remove(); };
}

/* ---------------- PROYECTOS ---------------- */
/* ============================================================
   MESES Y PROYECTOS
   ============================================================ */
const LABELS_PROYECTO = {planeacion:'En planeación', en_curso:'En curso', en_revision:'En revisión', completado:'Completado', pausado:'Pausado'};
function primerDiaMes(ym){ return ym+'-01'; }
function ultimoDiaMes(ym){ const [y,m] = ym.split('-').map(Number); return ymd(new Date(y, m, 0)); }
function sumarMeses(ym, n){ const [y,m] = ym.split('-').map(Number); const d = new Date(y, m-1+n, 1); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); }
function nombreMes(ym){ const [y,m] = ym.split('-').map(Number); return new Date(y, m-1, 1).toLocaleDateString('es-CO',{month:'long', year:'numeric'}); }
function nombreMesSolo(ym){ const [y,m] = ym.split('-').map(Number); return new Date(y, m-1, 1).toLocaleDateString('es-CO',{month:'long'}); }
function sumarDias(d, n){ if(!d) return ''; const x = new Date(d+'T00:00:00'); x.setDate(x.getDate()+n); return ymd(x); }
function mesValido(v){ return /^\d{4}-(0[1-9]|1[0-2])$/.test(v||''); }
function rangoProyecto(p){
  const base = p.created_at ? ymd(new Date(p.created_at)) : hoyStr();
  const ini = p.fecha_inicio || p.fecha_limite || base;
  let fin = p.fecha_limite || p.fecha_inicio || base;
  if(fin < ini) fin = ini;
  return {ini, fin};
}
function textoRango(r){
  const f = d=> new Date(d+'T00:00:00').toLocaleDateString('es-CO',{day:'numeric', month:'short'}).replace('.','');
  return `${f(r.ini)} – ${f(r.fin)} de ${new Date(r.fin+'T00:00:00').getFullYear()}`;
}
function mesesDelRango(r){
  const out = []; let m = r.ini.slice(0,7); const fin = r.fin.slice(0,7);
  while(m <= fin && out.length < 60){ out.push(m); m = sumarMeses(m,1); }
  return out;
}
function proyectoEnMes(p, ym){ const r = rangoProyecto(p); return r.ini <= ultimoDiaMes(ym) && r.fin >= primerDiaMes(ym); }
function tareasDeProyecto(p){ return STATE.tareas.filter(t=>t.proyecto_id===p.id); }
// Una solicitud puede tener varias tareas: las de ahora (solicitud_id) y la primera de las versiones anteriores (tarea_id).
function tareasDeSolicitud(s){ return STATE.tareas.filter(t=>t.solicitud_id===s.id || (s.tarea_id && t.id===s.tarea_id)); }
function textoConversion(s){
  const pr = s.proyecto_id ? STATE.proyectos.find(p=>p.id===s.proyecto_id) : null;
  if(pr) return 'Proyecto: '+pr.nombre;
  const n = tareasDeSolicitud(s).length;
  return n>1 ? `Convertida en ${n} tareas` : 'Convertida en tarea';
}

// 'actuales': los proyectos del mes en curso + CUALQUIER proyecto sin terminar que ya debió cerrar (nunca se esconde trabajo abierto).
function proyectoVisible(p, vista, ctx){
  if(vista==='todos') return true;
  if(vista==='mes') return proyectoEnMes(p, ctx.mesElegido);
  if(proyectoEnMes(p, ctx.mesActual)) return true;
  return p.estado!=='completado' && rangoProyecto(p).fin < primerDiaMes(ctx.mesActual);
}
// Tras crear o mover un proyecto: si quedó fuera de la vista actual, se lleva la vista a su mes para que no «desaparezca».
function asegurarVisible(p){
  const mesActual = hoyStr().slice(0,7);
  const ctx = {mesActual, mesElegido: sumarMeses(mesActual, STATE.proyMesOffset)};
  if(proyectoVisible(p, STATE.vistaProyectos, ctx)) return false;
  const [y1,m1] = mesActual.split('-').map(Number), [y2,m2] = rangoProyecto(p).ini.slice(0,7).split('-').map(Number);
  STATE.vistaProyectos = 'mes'; STATE.proyMesOffset = (y2-y1)*12 + (m2-m1);
  return true;
}

function renderAdminProyectos(){
  $('#view-proyectos').innerHTML = `
    <div class="section-title">Proyectos <button class="btn small" id="btn-nuevo-proyecto">+ Nuevo proyecto</button></div>
    <div id="proyectos-controls"></div>
    <div id="lista-proyectos"></div>`;
  $('#btn-nuevo-proyecto').onclick = ()=> openProyectoModal(null);
  renderListaProyectos();
}

function renderListaProyectos(){
  const ctrl = $('#proyectos-controls'), cont = $('#lista-proyectos');
  if(!cont) return;
  cont.innerHTML = '';
  if(STATE.proyectos.length===0){
    ctrl.innerHTML = '';
    cont.innerHTML = `<div class="empty-state">No hay proyectos todavía. Crea uno con «Nuevo proyecto» o conviértelo desde una solicitud.</div>`;
    return;
  }
  const vista = STATE.vistaProyectos;
  const mesActual = hoyStr().slice(0,7);
  const mesElegido = sumarMeses(mesActual, STATE.proyMesOffset);
  const ctx = {mesActual, mesElegido};
  const visibles = STATE.proyectos.filter(p=>proyectoVisible(p, vista, ctx));
  const ocultos = STATE.proyectos.length - visibles.length;
  const opciones = [['actuales','Este mes'],['mes','Por mes'],['todos','Todos']];

  let detalle = '';
  if(vista==='mes'){
    const nT = visibles.reduce((a,p)=>a+tareasDeProyecto(p).length, 0);
    detalle = `
      <div class="week-nav">
        <button class="btn secondary small" id="pm-prev">‹ Anterior</button>
        <h3>${STATE.proyMesOffset===0?'Este mes · ':''}${nombreMes(mesElegido)}</h3>
        <button class="btn secondary small" id="pm-hoy">Este mes</button>
        <button class="btn secondary small" id="pm-next">Siguiente ›</button>
      </div>
      <div class="hint">${visibles.length} proyecto${visibles.length===1?'':'s'} · ${nT} tarea${nT===1?'':'s'}</div>`;
  } else {
    const texto = vista==='actuales'
      ? 'Los proyectos de este mes y cualquiera que siga abierto aunque ya haya pasado su fecha.'
      : 'Todos los proyectos, de cualquier mes.';
    const aviso = (vista==='actuales' && ocultos>0)
      ? ` · <a href="#" id="pm-ver-todos">${ocultos} de otros meses (ver todos)</a>` : '';
    detalle = `<div class="hint">${texto}${aviso}</div>`;
  }
  ctrl.innerHTML = `<div class="chips">${opciones.map(([k,l])=>`<button class="chip ${vista===k?'active':''}" data-vista-proy="${k}">${l}</button>`).join('')}</div>${detalle}`;
  const cambiar = v=>{ STATE.vistaProyectos = v; try{ localStorage.setItem('equipo_vista_proyectos', v); }catch(e){} renderListaProyectos(); };
  ctrl.querySelectorAll('[data-vista-proy]').forEach(b=> b.onclick = ()=> cambiar(b.dataset.vistaProy));
  const vt = ctrl.querySelector('#pm-ver-todos'); if(vt) vt.onclick = e=>{ e.preventDefault(); cambiar('todos'); };
  if(vista==='mes'){
    $('#pm-prev', ctrl).onclick = ()=>{ STATE.proyMesOffset--; renderListaProyectos(); };
    $('#pm-next', ctrl).onclick = ()=>{ STATE.proyMesOffset++; renderListaProyectos(); };
    $('#pm-hoy', ctrl).onclick = ()=>{ STATE.proyMesOffset = 0; renderListaProyectos(); };
  }

  if(visibles.length===0){ cont.innerHTML = `<div class="empty-state">${vista==='mes'?'No hay proyectos en este mes.':'No hay proyectos en esta vista.'}</div>`; return; }
  const lista = [...visibles].sort((a,b)=> rangoProyecto(a).ini.localeCompare(rangoProyecto(b).ini) || (a.nombre||'').localeCompare(b.nombre||''));
  lista.forEach(p=>{
    const r = rangoProyecto(p);
    const ts = tareasDeProyecto(p);
    const hechas = ts.filter(t=>t.estado==='completada').length;
    const pct = ts.length ? Math.round(hechas/ts.length*100) : 0;
    const origen = STATE.solicitudes.find(x=>x.proyecto_id===p.id);
    const deAntes = p.estado!=='completado' && r.fin < primerDiaMes(mesActual);
    const mi = r.ini.slice(0,7), mf = r.fin.slice(0,7);
    const abarca = mi!==mf ? ` · abarca de ${nombreMesSolo(mi)} a ${nombreMesSolo(mf)}` : '';
    const pillEstado = p.estado==='completado' ? 'ok' : (p.estado==='pausado'||p.estado==='planeacion' ? 'dim' : 'warn');
    cont.appendChild(el(`
      <div class="list-row" style="align-items:flex-start;">
        <div class="flex-grow">
          <div class="person-name"><span class="dot" style="background:${esc(p.color||'#8a8a84')};"></span>${esc(p.nombre)}</div>
          <div class="person-role">${esc(p.marca||'Sin marca')} · ${textoRango(r)}${abarca}</div>
          ${origen?`<div class="person-role">Origen: solicitud de ${esc(origen.area_solicitante)}</div>`:''}
          <div class="proj-progress"><div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div><span class="person-role">${ts.length?`${hechas} de ${ts.length} tarea${ts.length===1?'':'s'}`:'Sin tareas todavía'}</span></div>
          <div class="meta" style="margin-top:10px;"><span class="pill ${pillEstado}">${LABELS_PROYECTO[p.estado]||esc(p.estado)}</span>${deAntes?' <span class="pill danger">De un mes anterior</span>':''}</div>
        </div>
        <div class="row-actions">
          <button class="btn secondary small" data-lote="${p.id}">+ Tareas</button>
          <button class="btn secondary small" data-mes="${p.id}">Cambiar mes</button>
          <button class="btn secondary small" data-edit="${p.id}">Editar</button>
          <button class="btn danger small" data-del="${p.id}">Eliminar</button>
        </div>
      </div>`));
  });
  cont.querySelectorAll('[data-lote]').forEach(b=> b.onclick = ()=> openTareasLoteModal({proyecto: STATE.proyectos.find(x=>x.id===b.dataset.lote)}));
  cont.querySelectorAll('[data-mes]').forEach(b=> b.onclick = ()=> openProyectoMesModal(b.dataset.mes));
  cont.querySelectorAll('[data-edit]').forEach(b=> b.onclick = ()=> openProyectoModal(b.dataset.edit));
  cont.querySelectorAll('[data-del]').forEach(b=> b.onclick = async ()=>{
    const p = STATE.proyectos.find(x=>x.id===b.dataset.del); if(!p) return;
    const n = tareasDeProyecto(p).length;
    if(!confirm(n ? `Eliminar «${esc(p.nombre)}» también elimina sus ${n} tarea${n===1?'':'s'}. Esta acción no se puede deshacer. ¿Continuar?` : `¿Eliminar el proyecto «${esc(p.nombre)}»?`)) return;
    await supa.from('proyectos').delete().eq('id', p.id);
    await loadAll(); renderAdminProyectos(); toast('Proyecto eliminado');
  });
}

// Quedarse en el mes, extenderse a otro, o moverse: todo se resuelve cambiando «desde» y «hasta» (por mes).
function openProyectoMesModal(id){
  const p = STATE.proyectos.find(x=>x.id===id); if(!p) return;
  const r = rangoProyecto(p);
  const desde0 = r.ini.slice(0,7), hasta0 = r.fin.slice(0,7);
  const overlay = el(`
    <div class="modal-overlay"><div class="modal">
      <h3>Mes del proyecto</h3>
      <p class="hint" style="margin-top:-8px;"><strong>${esc(p.nombre)}</strong> · hoy: ${textoRango(r)}</p>
      <div class="chips" style="margin-bottom:18px;">
        <button type="button" class="chip" id="mes-extender">Extender un mes más</button>
        <button type="button" class="chip" id="mes-mover">Pasar al mes siguiente</button>
      </div>
      <div class="field-row">
        <div class="field"><label>Desde (mes)</label><input type="month" id="mes-desde" value="${desde0}" placeholder="2026-10"></div>
        <div class="field"><label>Hasta (mes)</label><input type="month" id="mes-hasta" value="${hasta0}" placeholder="2026-10"></div>
      </div>
      <p class="hint" id="mes-resumen"></p>
      <p class="hint" style="margin-top:-6px;">Las tareas del proyecto conservan sus propias fechas de entrega.</p>
      <div class="modal-actions">
        <button class="btn secondary" id="cancel">Cancelar</button>
        <button class="btn" id="save">Guardar</button>
      </div>
    </div></div>`);
  document.body.appendChild(overlay);
  const d = $('#mes-desde', overlay), h = $('#mes-hasta', overlay), res = $('#mes-resumen', overlay);
  const resumen = ()=>{
    if(!mesValido(d.value) || !mesValido(h.value)){ res.textContent = 'Escribe los meses con el formato AAAA-MM (por ejemplo 2026-10).'; return; }
    if(h.value < d.value){ res.textContent = 'El mes final no puede ser anterior al inicial.'; return; }
    const ms = mesesDelRango({ini:primerDiaMes(d.value), fin:ultimoDiaMes(h.value)}).map(nombreMes);
    res.textContent = ms.length===1 ? `Quedará solo en ${ms[0]}.` : `Aparecerá en ${ms.length} meses: ${ms.join(', ')}.`;
  };
  d.oninput = h.oninput = d.onchange = h.onchange = resumen; resumen();
  $('#mes-extender', overlay).onclick = ()=>{ if(mesValido(h.value)){ h.value = sumarMeses(h.value, 1); resumen(); } };
  $('#mes-mover', overlay).onclick = ()=>{ if(mesValido(d.value) && mesValido(h.value)){ d.value = sumarMeses(d.value, 1); h.value = sumarMeses(h.value, 1); resumen(); } };
  $('#cancel', overlay).onclick = ()=> overlay.remove();
  $('#save', overlay).onclick = async ()=>{
    if(!mesValido(d.value) || !mesValido(h.value) || h.value < d.value){ toast('Revisa los meses: el final no puede ser antes del inicio'); return; }
    const cambios = {};
    if(d.value !== desde0) cambios.fecha_inicio = primerDiaMes(d.value);
    if(h.value !== hasta0) cambios.fecha_limite = ultimoDiaMes(h.value);
    if(Object.keys(cambios).length){ await supa.from('proyectos').update(cambios).eq('id', p.id); }
    overlay.remove();
    await loadAll();
    const pg = STATE.proyectos.find(x=>x.id===p.id);
    const movido = pg ? asegurarVisible(pg) : false;
    renderAdminProyectos();
    toast(Object.keys(cambios).length ? (movido ? `Listo. Ahora lo ves en ${nombreMes(rangoProyecto(pg).ini.slice(0,7))}` : 'Proyecto actualizado') : 'Sin cambios');
  };
}

function openProyectoModal(id){
  const p = id ? STATE.proyectos.find(x=>x.id===id) : null;
  const overlay = el(`
    <div class="modal-overlay">
      <div class="modal">
        <h3>${p?'Editar':'Nuevo'} proyecto</h3>
        <div class="field"><label>Nombre</label><input id="f-nombre" value="${esc(p?p.nombre:'')}"></div>
        <div class="field"><label>Marca / cliente interno</label><input id="f-marca" value="${esc(p?p.marca||'':'')}"></div>
        <div class="field-row">
        <div class="field"><label>Fecha inicio</label><input type="date" id="f-inicio" value="${p?p.fecha_inicio||'':''}"></div>
        <div class="field"><label>Fecha límite</label><input type="date" id="f-limite" value="${p?p.fecha_limite||'':''}"></div>
        </div>
        <div class="field"><label>Estado</label>
          <select id="f-estado">${ESTADOS_PROYECTO.map(e=>`<option value="${e}" ${p&&p.estado===e?'selected':''}>${LABELS_PROYECTO[e]||e}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Color de marca (para identificar sus tareas de un vistazo)</label><input type="color" id="f-color" value="${colorSeguro(p&&p.color)}" style="height:38px;padding:2px;"></div>
        <div class="modal-actions">
          <button class="btn secondary" id="cancel">Cancelar</button>
          <button class="btn" id="save">Guardar</button>
        </div>
      </div>
    </div>`);
  document.body.appendChild(overlay);
  $('#cancel', overlay).onclick = ()=> overlay.remove();
  $('#save', overlay).onclick = async ()=>{
    const nombre = $('#f-nombre', overlay).value.trim();
    if(!nombre){ toast('El nombre es obligatorio'); return; }
    const payload = {
      nombre,
      marca: $('#f-marca', overlay).value.trim(),
      fecha_inicio: $('#f-inicio', overlay).value || null,
      fecha_limite: $('#f-limite', overlay).value || null,
      estado: $('#f-estado', overlay).value,
      color: $('#f-color', overlay).value
    };
    let pid = p ? p.id : null;
    if(p) await supa.from('proyectos').update(payload).eq('id', p.id);
    else { const rr = await supa.from('proyectos').insert(payload).select(); pid = rr.data && rr.data[0] ? rr.data[0].id : null; }
    overlay.remove();
    await loadAll();
    const pg = STATE.proyectos.find(x=>x.id===pid);
    const movido = pg ? asegurarVisible(pg) : false;
    renderAdminProyectos();
    toast(movido ? `Proyecto guardado · lo ves en ${nombreMes(rangoProyecto(pg).ini.slice(0,7))}` : 'Proyecto guardado');
  };
}

/* ---------------- TAREAS ---------------- */
function tareasFiltradas(){
  const f = STATE.filtroTareas;
  return STATE.tareas.filter(t=>
    (!f.talento || t.talento_id===f.talento) &&
    (!f.proyecto || t.proyecto_id===f.proyecto) &&
    (!f.prioridad || t.prioridad===f.prioridad) &&
    (!f.estado || (f.estado==='atrasada' ? isAtrasada(t) : t.estado===f.estado)) &&
    (!f.q || t.titulo.toLowerCase().includes(f.q.toLowerCase()) || (t.descripcion||'').toLowerCase().includes(f.q.toLowerCase()))
  );
}

function renderAdminTareas(){
  $('#view-tareas').innerHTML = `
    <div class="section-title">Tareas <button class="btn small" id="btn-nueva-tarea">+ Nueva tarea</button></div>
    <div class="filtros">
      <input type="text" id="fil-q" placeholder="Buscar título o descripción..." value="${esc(STATE.filtroTareas.q)}">
      <select id="fil-talento"><option value="">Todos los talentos</option>${STATE.talentos.map(t=>`<option value="${t.id}" ${STATE.filtroTareas.talento===t.id?'selected':''}>${esc(t.nombre)}</option>`).join('')}</select>
      <select id="fil-proyecto"><option value="">Todos los proyectos</option>${STATE.proyectos.map(p=>`<option value="${p.id}" ${STATE.filtroTareas.proyecto===p.id?'selected':''}>${esc(p.nombre)}</option>`).join('')}</select>
      <select id="fil-prioridad"><option value="">Toda prioridad</option>${PRIORIDADES.map(p=>`<option value="${p}" ${STATE.filtroTareas.prioridad===p?'selected':''}>${p}</option>`).join('')}</select>
      <select id="fil-estado">
        <option value="">Todo estado</option>
        ${ESTADOS_TAREA.map(e=>`<option value="${e.key}" ${STATE.filtroTareas.estado===e.key?'selected':''}>${e.label}</option>`).join('')}
        <option value="atrasada" ${STATE.filtroTareas.estado==='atrasada'?'selected':''}>Atrasada</option>
      </select>
      <button class="btn secondary small" id="fil-limpiar">Limpiar</button>
    </div>
    <div id="lista-tareas"></div>`;
  $('#btn-nueva-tarea').onclick = ()=> openTareaModal(null);
  $('#fil-q').oninput = e=>{ STATE.filtroTareas.q = e.target.value; renderListaTareas(); };
  $('#fil-talento').onchange = e=>{ STATE.filtroTareas.talento = e.target.value; renderListaTareas(); };
  $('#fil-proyecto').onchange = e=>{ STATE.filtroTareas.proyecto = e.target.value; renderListaTareas(); };
  $('#fil-prioridad').onchange = e=>{ STATE.filtroTareas.prioridad = e.target.value; renderListaTareas(); };
  $('#fil-estado').onchange = e=>{ STATE.filtroTareas.estado = e.target.value; renderListaTareas(); };
  $('#fil-limpiar').onclick = ()=>{ STATE.filtroTareas = {talento:'', proyecto:'', prioridad:'', estado:'', q:''}; renderAdminTareas(); };
  renderListaTareas();
}

function renderListaTareas(){
  const cont = $('#lista-tareas');
  cont.innerHTML='';
  const lista = tareasFiltradas();
  if(lista.length===0){ cont.innerHTML=`<div class="empty-state">No hay tareas que coincidan.</div>`; return; }
  lista.forEach(t=>{
    const proy = STATE.proyectos.find(p=>p.id===t.proyecto_id);
    const colorMarca = proy && proy.color ? colorSeguro(proy.color) : null;
    cont.appendChild(el(`
      <div class="list-row" style="align-items:flex-start;${colorMarca?`border-left:3px solid ${colorMarca};`:''}">
        <div class="flex-grow">
          <div class="person-name">${esc(t.titulo)}</div>
          <div class="person-role">${esc(proyectoNombre(t.proyecto_id))} · ${esc(talentoNombre(t.talento_id))} · Entrega: ${fmtDate(t.fecha_entrega)}</div>
          <div class="meta" style="margin-top:6px;">${pillEstadoTarea(t)} ${pillVencimiento(t)} ${pillPrioridad(t.prioridad)}
          ${t.link_archivo?`<a href="${esc(urlSegura(t.link_archivo)||'#')}" rel="noopener" target="_blank" class="pill ok">Ver archivo</a>`:''}
          ${avancesDe(t.id).length?`<span class="pill dim">${avancesDe(t.id).length} avance(s)</span>`:''}${(t.material_url||t.material_links)?' <span class="pill dim">'+ico('clip')+' Material</span>':''}</div>
        </div>
        <div class="row-actions">
          <button class="btn secondary small" data-edit="${t.id}">Editar</button>
          <button class="btn danger small" data-del="${t.id}">Eliminar</button>
        </div>
      </div>`));
  });
  cont.querySelectorAll('[data-edit]').forEach(b=> b.onclick = ()=> openTareaModal(b.dataset.edit));
  cont.querySelectorAll('[data-del]').forEach(b=> b.onclick = ()=> deleteRow('tareas', b.dataset.del, renderAdminTareas));
}

function openTareaModal(id, prefill){
  const t = id ? STATE.tareas.find(x=>x.id===id) : null;
  const pf = prefill || {};
  const matTarea = t ? materialDeTarea(t) : {url:pf.material_url, nombre:pf.material_nombre, links:pf.material_links};
  const materialBloque = materialHTML(matTarea, pf._solicitudId ? 'Material de la solicitud (se adjuntará a la tarea)' : 'Material para trabajar (lo ve el aprendiz)');
  const overlay = el(`
    <div class="modal-overlay">
      <div class="modal">
        <h3>${t?'Editar':'Nueva'} tarea</h3>
        ${pf._solicitudId?`<p class="hint" style="margin:-8px 0 16px;">Creando desde una solicitud entrante: revisa y completa los campos.</p>`:''}
        <div class="field"><label>Título</label><input id="f-titulo" value="${esc(t?t.titulo:(pf.titulo||''))}"></div>
        <div class="field"><label>Descripción</label><textarea id="f-desc">${esc(t?t.descripcion||'':(pf.descripcion||''))}</textarea></div>
        ${materialBloque}
        <div class="field-row">
        <div class="field"><label>Proyecto</label>
          <select id="f-proyecto"><option value="">— Sin proyecto —</option>${STATE.proyectos.map(p=>`<option value="${p.id}" ${t&&t.proyecto_id===p.id?'selected':''}>${esc(p.nombre)}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Tipo</label><input id="f-tipo" value="${esc(t?t.tipo||'':(pf.tipo||''))}" placeholder="Diseño, fotografía, video, copy, pauta..."></div>
        </div>
        <div class="field-row">
        <div class="field"><label>Talento asignado</label>
          <select id="f-talento"><option value="">— Sin asignar —</option>${STATE.talentos.map(p=>`<option value="${p.id}" ${t&&t.talento_id===p.id?'selected':''}>${esc(p.nombre)}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Fecha de entrega</label><input type="date" id="f-fecha" value="${t?t.fecha_entrega||'':(pf.fecha_entrega||'')}"></div>
        </div>
        <div class="field-row">
        <div class="field"><label>Prioridad</label>
          <select id="f-prioridad">${PRIORIDADES.map(p=>`<option value="${p}" ${(t?t.prioridad===p:pf.prioridad===p)?'selected':''}>${p}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Estado</label>
          <select id="f-estado">${ESTADOS_TAREA.filter(e=> e.key!=='completada' || (t && t.estado==='completada')).map(e=>`<option value="${e.key}" ${t&&t.estado===e.key?'selected':''}>${e.label}</option>`).join('')}</select>
        </div>
        </div>
        <div class="field"><label>Link del archivo final (al completar)</label><input id="f-link" value="${esc(t?t.link_archivo||'':'')}" placeholder="https://..."></div>
        <div class="modal-actions">
          <button class="btn secondary" id="cancel">Cancelar</button>
          <button class="btn" id="save">Guardar</button>
        </div>
        ${t?`
        <div class="avance-form" style="display:flex;gap:8px;flex-wrap:wrap;">
          ${t.estado!=='completada'?`<button class="btn small ok" id="btn-revisar">${ico('check')} ${t.estado==='en_revision'?'Revisar entrega':'Aprobar y completar'}</button>`:''}
          <button class="btn secondary small" id="btn-imprimir-brief">${ico('print')} Imprimir brief</button>
          ${t.fecha_entrega?`<button class="btn secondary small" id="btn-ics">${ico('cal')} Agregar a calendario</button>`:''}
        </div>
        <div class="avance-form">
          <label style="display:block;font-size:12px;color:var(--text-dim);margin-bottom:8px;">Avances, archivos e historial</label>
          <div id="avances-list"></div>
          <div class="field" style="margin-top:10px;"><textarea id="f-avance-desc" placeholder="Describe el avance..."></textarea></div>
          <div class="field"><input type="file" id="f-avance-file"></div>
          <button class="btn secondary small" id="btn-add-avance">+ Agregar avance</button>
          <div id="avance-progress" style="font-size:11px;color:var(--text-dim);margin-top:6px;"></div>
        </div>`:''}
      </div>
    </div>`);
  document.body.appendChild(overlay);
  if(t) renderAvancesModal(overlay, t.id);
  $('#cancel', overlay).onclick = ()=> overlay.remove();
  $('#save', overlay).onclick = async ()=>{
    const titulo = $('#f-titulo', overlay).value.trim();
    if(!titulo){ toast('El título es obligatorio'); return; }
    const nuevoEstado = $('#f-estado', overlay).value;
    const payload = {
      titulo,
      descripcion: $('#f-desc', overlay).value.trim(),
      proyecto_id: $('#f-proyecto', overlay).value || null,
      tipo: $('#f-tipo', overlay).value.trim(),
      talento_id: $('#f-talento', overlay).value || null,
      fecha_entrega: $('#f-fecha', overlay).value || null,
      prioridad: $('#f-prioridad', overlay).value,
      estado: nuevoEstado,
      link_archivo: $('#f-link', overlay).value.trim(),
      updated_at: new Date().toISOString()
    };
    if(t){
      await supa.from('tareas').update(payload).eq('id', t.id);
      await registrarCambioEstado(t.id, t.estado, nuevoEstado);
    } else {
      if(pf.material_url || pf.material_links){
        payload.material_url = pf.material_url || null;
        payload.material_nombre = pf.material_nombre || null;
        payload.material_links = pf.material_links || null;
      }
      const { data, error } = await supa.from('tareas').insert(payload).select();
      if(error || !data || !data[0]){
        toast('No se pudo guardar la tarea' + (error ? ': '+error.message : '') + (payload.material_url||payload.material_links ? '. ¿Ya corriste la migración v5 en Supabase?' : ''));
        return;
      }
      if(pf._solicitudId){
        await supa.from('solicitudes').update({estado:'convertida', tarea_id:data[0].id, updated_at:new Date().toISOString()}).eq('id', pf._solicitudId);
      }
    }
    overlay.remove();
    await loadAll(); renderAdminTab();
    toast(pf._solicitudId ? 'Solicitud convertida en tarea' : 'Tarea guardada');
  };
  if(t){
    $('#btn-imprimir-brief', overlay).onclick = ()=> generarBriefTarea(t.id);
    if($('#btn-ics', overlay)) $('#btn-ics', overlay).onclick = ()=> descargarICS(t);
    if($('#btn-revisar', overlay)) $('#btn-revisar', overlay).onclick = ()=>{ overlay.remove(); abrirAprobacion(t.id); };
  }
  if(t){
    $('#btn-add-avance', overlay).onclick = async ()=>{
      const desc = $('#f-avance-desc', overlay).value.trim();
      if(!desc){ toast('Escribe una descripción del avance'); return; }
      const fileInput = $('#f-avance-file', overlay);
      const file = fileInput.files[0];
      const progressEl = $('#avance-progress', overlay);
      let archivo_url = null, archivo_nombre = null;
      try{
        if(file){
          progressEl.textContent = 'Subiendo archivo...';
          const path = `${t.id}/${Date.now()}_${file.name}`;
          const { error: upErr } = await supa.storage.from(BUCKET_ARCHIVOS).upload(path, file);
          if(upErr) throw upErr;
          const { data: pub } = supa.storage.from(BUCKET_ARCHIVOS).getPublicUrl(path);
          archivo_url = pub.publicUrl;
          archivo_nombre = file.name;
        }
        await supa.from('avances').insert({
          tarea_id: t.id, descripcion: desc, autor: NOMBRE_ADMIN,
          archivo_url, archivo_nombre
        });
        await loadAll();
        $('#f-avance-desc', overlay).value = '';
        fileInput.value = '';
        progressEl.textContent = '';
        renderAvancesModal(overlay, t.id);
        toast('Avance agregado');
      }catch(err){
        progressEl.textContent = 'Error al subir. Verifica que creaste el bucket "archivos" en Supabase (ver migración v2).';
      }
    };
  }
}

/* ---------------- METAS ---------------- */
function renderAdminMetas(){
  $('#view-metas').innerHTML = `
    <div class="section-title">Metas <button class="btn small" id="btn-nueva-meta">+ Nueva meta</button></div>
    <div id="metas-chart-wrap"></div>
    <div id="lista-metas"></div>`;
  $('#btn-nueva-meta').onclick = ()=> openMetaModal(null);
  renderMetasTrendChart();
  const cont = $('#lista-metas');
  cont.innerHTML='';
  if(STATE.metas.length===0){ cont.innerHTML=`<div class="empty-state">No hay metas configuradas.</div>`; return; }
  STATE.metas.forEach(m=>{
    let real = null;
    if(m.talento_id) real = cumplimientoDe(m.talento_id);
    const pct = real===null? 0 : real;
    cont.appendChild(el(`
      <div class="list-row" style="align-items:flex-start;">
        <div class="flex-grow">
          <div class="person-name">${esc(m.descripcion)}</div>
          <div class="person-role">${esc(m.talento_id?talentoNombre(m.talento_id):(m.proyecto_id?proyectoNombre(m.proyecto_id):'General'))} · Periodo: ${esc(m.periodo||'—')} · Meta: ${m.meta_porcentaje}%</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(pct,100)}%"></div></div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">Real: ${real===null?'sin datos':pct+'%'}</div>
        </div>
        <div class="row-actions">
          <button class="btn danger small" data-del="${m.id}">Eliminar</button>
        </div>
      </div>`));
  });
  cont.querySelectorAll('[data-del]').forEach(b=> b.onclick = ()=> deleteRow('metas', b.dataset.del, renderAdminMetas));
}

function renderMetasTrendChart(){
  const wrap = $('#metas-chart-wrap');
  if(!wrap) return;
  const periodos = [...new Set(STATE.metas.map(m=>m.periodo).filter(Boolean))].sort();
  if(periodos.length===0){ wrap.innerHTML=''; return; }
  wrap.innerHTML = `<div class="chart-box" style="margin-bottom:20px;"><h3>Meta vs. real por periodo</h3><div class="chart-canvas"><canvas id="chart-metas-trend"></canvas></div></div>`;
  const metaProm = periodos.map(per=>{
    const ms = STATE.metas.filter(m=>m.periodo===per);
    return Math.round(ms.reduce((s,m)=>s+Number(m.meta_porcentaje||0),0)/ms.length);
  });
  const realProm = periodos.map(per=>{
    const ms = STATE.metas.filter(m=>m.periodo===per && m.talento_id);
    const reales = ms.map(m=>cumplimientoDe(m.talento_id)).filter(v=>v!==null);
    return reales.length? Math.round(reales.reduce((s,v)=>s+v,0)/reales.length) : 0;
  });
  destroyChart('chart-metas-trend');
  const th = temaGraficas();
  STATE.charts['chart-metas-trend'] = new Chart($('#chart-metas-trend'), {
    type:'bar',
    data:{labels:periodos, datasets:[
      {label:'Meta', data:metaProm, backgroundColor:th.strong, borderRadius:4, maxBarThickness:36},
      {label:'Real', data:realProm, backgroundColor:th.ink, borderRadius:4, maxBarThickness:36}
    ]},
    options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'top', align:'end', labels:{usePointStyle:true, pointStyle:'circle', boxWidth:7, boxHeight:7, color:th.ink2}}}, scales:ejesGraficas(th,{max:100})}
  });
}

function generarReporteMensual(){
  const now = new Date();
  const mesNombre = now.toLocaleDateString('es-CO',{month:'long', year:'numeric'});
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const filasTalento = STATE.talentos.map(t=>{
    const completadasMes = STATE.tareas.filter(x=>x.talento_id===t.id && x.estado==='completada' && new Date(x.updated_at)>=inicioMes);
    const cumpl = cumplimientoDe(t.id);
    const atrasadas = tareasAtrasadasDe(t.id);
    const tProm = tiempoPromedioEntrega(t.id);
    return `<tr>
      <td>${esc(t.nombre)}</td><td>${esc(t.rol)}</td>
      <td>${completadasMes.length}</td>
      <td>${atrasadas}</td>
      <td>${cumpl===null?'—':cumpl+'%'}</td>
      <td>${labelTiempoPromedio(tProm)}</td>
    </tr>`;
  }).join('');
  const html = `
    <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
    <title>Reporte mensual — LE COLLEZIONI</title>
    <style>
      body{font-family:Arial,sans-serif;padding:40px;color:#111;}
      h1{font-size:20px;margin-bottom:4px;}
      .sub{color:#666;font-size:13px;margin-bottom:24px;text-transform:capitalize;}
      table{width:100%;border-collapse:collapse;margin-top:10px;}
      th,td{border:1px solid #ddd;padding:8px 10px;font-size:13px;text-align:left;}
      th{background:#f5f5f5;}
      @media print{ .no-print{display:none;} }
    </style></head><body>
    <h1>LE COLLEZIONI · Reporte mensual del equipo creativo</h1>
    <div class="sub">${mesNombre}</div>
    <table>
      <thead><tr><th>Talento</th><th>Rol</th><th>Completadas este mes</th><th>Atrasadas actuales</th><th>Cumplimiento histórico</th><th>Tiempo de entrega</th></tr></thead>
      <tbody>${filasTalento}</tbody>
    </table>
    <p class="no-print" style="margin-top:24px;color:#666;font-size:12px;">Usa Ctrl+P (o Cmd+P) para guardar esta página como PDF.</p>
    </body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}

function generarBriefTarea(tareaId){
  const t = STATE.tareas.find(x=>x.id===tareaId);
  if(!t) return;
  const avances = avancesDe(t.id).filter(a=>a.autor!=='Sistema');
  const mat = materialDeTarea(t), matLinks = listaLinks(mat.links);
  const briefMaterial = (mat.url || matLinks.length)
    ? `<div class="desc"><b>Material de referencia</b>${mat.url?`<br>Archivo ${esc(mat.nombre||'')}: ${esc(mat.url)}`:''}${matLinks.map(l=>`<br>Enlace: ${esc(l)}`).join('')}</div>` : '';
  const html = `
    <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
    <title>Brief — ${esc(t.titulo)}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:700px;margin:0 auto;}
      h1{font-size:20px;margin-bottom:4px;}
      .sub{color:#666;font-size:13px;margin-bottom:24px;}
      .row{display:flex;gap:20px;margin-bottom:10px;font-size:13px;}
      .row b{width:140px;flex-shrink:0;}
      .desc{margin-top:20px;font-size:13px;white-space:pre-wrap;background:#f7f7f7;padding:14px;border-radius:6px;}
      .avances{margin-top:20px;}
      .avance{border-bottom:1px solid #eee;padding:8px 0;font-size:12px;}
      @media print{ .no-print{display:none;} }
    </style></head><body>
    <h1>LE COLLEZIONI · Brief de tarea</h1>
    <div class="sub">Generado ${new Date().toLocaleDateString('es-CO')}</div>
    <div class="row"><b>Título</b><span>${esc(t.titulo)}</span></div>
    <div class="row"><b>Proyecto</b><span>${esc(proyectoNombre(t.proyecto_id))}</span></div>
    <div class="row"><b>Tipo</b><span>${esc(t.tipo||'—')}</span></div>
    <div class="row"><b>Asignado a</b><span>${esc(talentoNombre(t.talento_id))}</span></div>
    <div class="row"><b>Fecha de entrega</b><span>${fmtDate(t.fecha_entrega)}</span></div>
    <div class="row"><b>Prioridad</b><span>${t.prioridad}</span></div>
    <div class="row"><b>Estado actual</b><span>${LABELS_ESTADO[t.estado]||t.estado}</span></div>
    ${t.descripcion?`<div class="desc">${esc(t.descripcion)}</div>`:''}
    ${briefMaterial}
    ${avances.length?`<div class="avances"><b>Avances registrados</b>${avances.map(a=>`<div class="avance">${fmtDate(a.created_at.slice(0,10))} — ${esc(a.descripcion)}</div>`).join('')}</div>`:''}
    <p class="no-print" style="margin-top:24px;color:#666;font-size:12px;">Usa Ctrl+P (o Cmd+P) para imprimir o guardar como PDF.</p>
    </body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html); w.document.close();
}

function descargarICS(t){
  const fecha = t.fecha_entrega.replace(/-/g,'');
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//LE COLLEZIONI//Equipo Creativo//ES',
    'BEGIN:VEVENT',
    `UID:${t.id}@equipo-creativo`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z`,
    `DTSTART;VALUE=DATE:${fecha}`,
    `DTEND;VALUE=DATE:${fecha}`,
    `SUMMARY:${(t.titulo||'').replace(/\n/g,' ')}`,
    `DESCRIPTION:${(t.descripcion||'').replace(/\n/g,' ')} - Asignado a: ${talentoNombre(t.talento_id)}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], {type:'text/calendar'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(t.titulo||'tarea').replace(/[^a-z0-9]/gi,'-')}.ics`;
  a.click();
}

function openMetaModal(){
  const overlay = el(`
    <div class="modal-overlay">
      <div class="modal">
        <h3>Nueva meta</h3>
        <div class="field"><label>Descripción</label><input id="f-desc" placeholder="Entregar 90% a tiempo este mes"></div>
        <div class="field"><label>Aplica a talento</label>
          <select id="f-talento"><option value="">— No aplica —</option>${STATE.talentos.map(t=>`<option value="${t.id}">${esc(t.nombre)}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Aplica a proyecto</label>
          <select id="f-proyecto"><option value="">— No aplica —</option>${STATE.proyectos.map(p=>`<option value="${p.id}">${esc(p.nombre)}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Meta (%)</label><input type="number" id="f-pct" value="90" min="0" max="100"></div>
        <div class="field"><label>Periodo (ej. 2026-08)</label><input id="f-periodo" placeholder="2026-08"></div>
        <div class="modal-actions">
          <button class="btn secondary" id="cancel">Cancelar</button>
          <button class="btn" id="save">Guardar</button>
        </div>
      </div>
    </div>`);
  document.body.appendChild(overlay);
  $('#cancel', overlay).onclick = ()=> overlay.remove();
  $('#save', overlay).onclick = async ()=>{
    const descripcion = $('#f-desc', overlay).value.trim();
    if(!descripcion){ toast('La descripción es obligatoria'); return; }
    const payload = {
      descripcion,
      talento_id: $('#f-talento', overlay).value || null,
      proyecto_id: $('#f-proyecto', overlay).value || null,
      meta_porcentaje: Number($('#f-pct', overlay).value) || 90,
      periodo: $('#f-periodo', overlay).value.trim()
    };
    await supa.from('metas').insert(payload);
    overlay.remove();
    await loadAll(); renderAdminMetas();
    toast('Meta guardada');
  };
}

/* ---------------- BORRADO GENÉRICO ---------------- */
async function deleteRow(table, id, refreshFn){
  if(!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return;
  await supa.from(table).delete().eq('id', id);
  await loadAll();
  refreshFn();
  toast('Eliminado');
}

/* ---------------- LINKS Y RESPALDO ---------------- */
function renderAdminLinks(){
  const base = location.origin + location.pathname;
  const view = $('#view-links');
  view.innerHTML = `
    <div class="section-title">Links para compartir</div>
    <div id="enlaces-seguros"></div>

    <div class="section-title">Links por aprendiz</div>
    <p class="hint enlace-hint">Cada aprendiz entra con su link y su clave de 4 dígitos (Talentos → Clave). Sin la clave no ve nada.</p>
    <div id="links-aprendices"></div>

    <div class="section-title">Instalar la app</div>
    <div class="list-row"><div class="flex-grow"><div class="person-name">En el computador o en el celular</div>
      <div style="font-size:12px;color:var(--text-dim);" id="inst-texto">Se abre en su propia ventana (computador) o a pantalla completa (celular) y todo se mantiene en línea. Instálala desde el link que usas tú.</div></div>
      <button class="btn small" id="btn-instalar">Instalar</button></div>

    <div class="section-title">Reporte</div>
    <button class="btn secondary" id="btn-reporte">Generar reporte mensual (imprimible / PDF)</button>

    <div class="section-title">Respaldo</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <button class="btn secondary" id="btn-export">Exportar JSON</button>
      <label class="btn secondary" style="cursor:pointer;">Importar JSON<input type="file" id="file-import" accept=".json" class="hidden"></label>
    </div>
  `;
  pintarEnlaces();
  $('#btn-reporte').onclick = generarReporteMensual;
  if(esStandalone()){ $('#btn-instalar').style.display = 'none'; $('#inst-texto').textContent = 'Ya estás usando la app instalada en este dispositivo.'; }
  else { $('#btn-instalar').onclick = instalarApp; }
  const cont = $('#links-aprendices');
  if(STATE.talentos.length===0){ cont.innerHTML = `<div class="empty-state">Crea talentos primero para generar sus links.</div>`; }
  STATE.talentos.forEach(t=>{
    const link = `${base}?aprendiz=${t.id}`;
    cont.appendChild(el(`
      <div class="list-row">
        <div class="avatar">${esc(t.avatar_inicial||initials(t.nombre))}</div>
        <div class="flex-grow"><div class="person-name">${esc(t.nombre)}</div><code style="font-size:11px;color:var(--text-dim);word-break:break-all;">${link}</code></div>
        <button class="btn small copy-link" data-link="${link}">Copiar</button>
      </div>`));
  });
  cont.querySelectorAll('.copy-link').forEach(b=> b.onclick = ()=>{ navigator.clipboard.writeText(b.dataset.link); toast('Link copiado'); });

  $('#btn-export').onclick = ()=>{
    const data = { talentos: STATE.talentos, proyectos: STATE.proyectos, tareas: STATE.tareas, metas: STATE.metas, exportado: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `equipo-creativo-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };
  $('#file-import').onchange = async (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const text = await file.text();
    try{
      const data = JSON.parse(text);
      if(!confirm('Esto agregará los registros del archivo a la base de datos actual (no borra lo existente). ¿Continuar?')) return;
      if(data.talentos) for(const t of data.talentos){ const {id,...rest}=t; await supa.from('talentos').insert(rest); }
      if(data.proyectos) for(const p of data.proyectos){ const {id,...rest}=p; await supa.from('proyectos').insert(rest); }
      // nota: tareas y metas dependen de ids nuevos, por eso solo se recomienda para proyectos/talentos en importaciones cruzadas
      await loadAll();
      renderAdminLinks();
      toast('Importación completada (talentos y proyectos)');
    }catch(err){ toast('Archivo inválido'); }
  };
}

/* ============================================================
   INSTALAR COMO APP, CONEXIÓN Y REFRESCO AL VOLVER
   ============================================================ */
(function(){
  const css = document.createElement('style');
  css.textContent = `
    #pwa-bar{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:150;display:flex;align-items:center;gap:12px;padding:10px 8px 10px 12px;background:var(--panel);color:var(--ink);border:1px solid var(--line-strong);border-radius:var(--r-lg);box-shadow:var(--shadow-pop);font-family:var(--font);animation:fade-in .2s ease-out;}
    #pwa-bar img{width:40px;height:40px;border-radius:9px;flex:none;}
    #pwa-bar .tx{flex:1;min-width:0;font-size:14px;line-height:1.25;}
    #pwa-bar .tx b{display:block;font-weight:600;}
    #pwa-bar .tx span{color:var(--ink-2);font-size:12px;}
    #pwa-bar .x{background:none;border:0;color:var(--ink-3);font-size:24px;line-height:1;padding:4px 10px;cursor:pointer;}
    #pwa-net{position:fixed;left:0;right:0;top:0;z-index:300;text-align:center;padding:8px 12px;font:600 13px var(--font);background:var(--warn-bg);color:var(--warn);border-bottom:1px solid var(--warn);backdrop-filter:blur(6px);}
  `;
  document.head.appendChild(css);

  window.esStandalone = function(){ return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; };
  window.esIOS = function(){ return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); };

  window.mostrarAyudaInstalar = function(){
    const ua = navigator.userAgent, ios = esIOS(), android = /android/i.test(ua);
    const edge = /edg\//i.test(ua), firefox = /firefox|fxios/i.test(ua);
    const safariMac = !ios && !android && /Macintosh/.test(ua) && /safari/i.test(ua) && !/chrome|chromium|crios|edg\//i.test(ua);
    let titulo, pasos;
    if(ios){ titulo = 'Instalar en el iPhone o iPad'; pasos = ['Abre esta página en <b>Safari</b> (no desde otra app).', 'Toca el botón <b>Compartir</b> (el cuadrado con la flecha hacia arriba).', 'Elige <b>«Añadir a pantalla de inicio»</b> y confirma con <b>Añadir</b>.']; }
    else if(android){ titulo = 'Instalar en el celular'; pasos = ['Abre esta página en <b>Chrome</b>.', 'Toca el menú <b>⋮</b> (arriba a la derecha).', 'Elige <b>«Instalar aplicación»</b> (o «Añadir a pantalla de inicio») y confirma.']; }
    else if(firefox){ titulo = 'Instalar en el computador'; pasos = ['Firefox no instala aplicaciones en computador.', 'Abre este mismo link en <b>Google Chrome</b> o <b>Microsoft Edge</b> y sigue los pasos desde ahí.']; }
    else if(safariMac){ titulo = 'Instalar en el Mac'; pasos = ['En el menú de arriba toca <b>Archivo</b>.', 'Elige <b>«Añadir al Dock…»</b> y confirma con <b>Añadir</b>.']; }
    else if(edge){ titulo = 'Instalar en el computador'; pasos = ['Toca el menú <b>⋯</b> (arriba a la derecha).', 'Elige <b>Aplicaciones</b> → <b>«Instalar este sitio como una aplicación»</b>.', 'Confirma con <b>Instalar</b>.']; }
    else { titulo = 'Instalar en el computador'; pasos = ['En <b>Google Chrome</b>, busca el icono de instalar (un monitor con una flecha) <b>al final de la barra de direcciones</b> y tócalo.', 'Si no lo ves: menú <b>⋮</b> → <b>«Instalar Equipo creativo»</b> (a veces está dentro de «Guardar y compartir»).', 'Confirma con <b>Instalar</b>. Queda con su ícono, como cualquier programa.']; }
    const o = el(`<div class="modal-overlay" id="pwa-ayuda"><div class="modal"><h3>${titulo}</h3>
      <ol style="padding-left:20px;line-height:1.7;font-size:14px;">${pasos.map(p=>`<li>${p}</li>`).join('')}</ol>
      <p class="hint">Se instala con el acceso del link que tienes abierto, así que ábrela con el tuyo. Después se abre en su propia ventana o a pantalla completa, como cualquier app, y se mantiene en línea.</p>
      <div class="modal-actions"><button class="btn" id="pwa-ok">Entendido</button></div></div></div>`);
    document.body.appendChild(o);
    o.querySelector('#pwa-ok').onclick = ()=>o.remove();
    o.onclick = (e)=>{ if(e.target === o) o.remove(); };
  };

  window.instalarApp = async function(){
    const ev = window.__pwa && window.__pwa.prompt;
    if(ev){
      ev.prompt();
      try{ await ev.userChoice; }catch(e){}
      window.__pwa.prompt = null;
      const b = document.getElementById('pwa-bar'); if(b) b.remove();
      return;
    }
    mostrarAyudaInstalar();
  };

  function mostrarBarraInstalar(){
    if(esStandalone() || document.getElementById('pwa-bar')) return;
    if(!['admin','aprendiz','jefe'].includes(STATE.mode)) return;
    const movil = !!(window.matchMedia && matchMedia('(max-width: 820px)').matches);
    if(!movil && STATE.mode!=='aprendiz') return;   // en computador el aviso sale solo para los aprendices
    try{ const t = +localStorage.getItem('equipo_pwa_cerrada') || 0; if(Date.now() - t < 14*864e5) return; }catch(e){}
    const hayPrompt = !!(window.__pwa && window.__pwa.prompt);
    if(!hayPrompt && !esIOS()) return;
    const bar = el(`<div id="pwa-bar" role="region" aria-label="Instalar la app"><img src="icon-192.png" alt="">
      <div class="tx"><b>Instala la app en tu ${movil?'celular':'computador'}</b><span>Pantalla completa y en línea</span></div>
      <button class="btn small" id="pwa-inst">Instalar</button><button class="x" id="pwa-x" aria-label="Cerrar">×</button></div>`);
    document.body.appendChild(bar);
    bar.querySelector('#pwa-inst').onclick = ()=>{ instalarApp(); };
    bar.querySelector('#pwa-x').onclick = ()=>{ try{ localStorage.setItem('equipo_pwa_cerrada', String(Date.now())); }catch(e){} bar.remove(); };
  }
  window.addEventListener('pwa-lista', ()=>setTimeout(mostrarBarraInstalar, 800));
  setTimeout(mostrarBarraInstalar, 3500);

  // Aviso sin conexión
  function quitarAviso(){ const n = document.getElementById('pwa-net'); if(n) n.remove(); }
  function ponerAviso(){ if(document.getElementById('pwa-net')) return; const n = document.createElement('div'); n.id = 'pwa-net'; n.textContent = 'Sin conexión. Se actualizará solo cuando vuelva el internet.'; document.body.appendChild(n); }
  if(navigator.onLine === false) ponerAviso();

  // Al volver a la app (o recuperar internet) se vuelven a leer los datos: en el celular la conexión en vivo
  // se duerme con la pantalla apagada y los cambios hechos mientras tanto no llegaban solos.
  let ocultaDesde = 0;
  function refrescarVivo(){
    if(!STATE._refrescar || document.querySelector('.modal-overlay')) return;   // no se interrumpe un formulario abierto
    loadAll().then(()=>STATE._refrescar()).catch(()=>{});
  }
  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState === 'hidden'){ ocultaDesde = Date.now(); return; }
    if(ocultaDesde && Date.now() - ocultaDesde > 15000) refrescarVivo();
  });
  window.addEventListener('online', ()=>{ quitarAviso(); refrescarVivo(); });
  window.addEventListener('offline', ponerAviso);
})();

/* ============================================================
   PANEL CRISTAL: menú lateral plegable, barra superior con buscador,
   dock inferior (celular), menú "Nuevo" y buscador tipo comando.
   ============================================================ */
const NOMBRE_ADMIN = 'Jefe';      // cómo se llama el administrador en el saludo, el historial y los mensajes
const EL_JEFE = 'el jefe';        // el mismo nombre dentro de una frase ("pídele al jefe…")
Object.assign(ICONS, {
  search:'<circle cx="7" cy="7" r="4.6"/><path d="M10.6 10.6L14 14"/>',
  plus:'<path d="M8 3v10M3 8h10"/>',
  chevL:'<path d="M9.8 3.5L5.3 8l4.5 4.5"/>',
  ajustes:'<path d="M2 4.5h7M12.5 4.5H14M2 11.5h1.5M7 11.5h7"/><circle cx="10.7" cy="4.5" r="1.7"/><circle cx="5.2" cy="11.5" r="1.7"/>',
  salir:'<path d="M6.5 2.5H4A1.5 1.5 0 002.5 4v8A1.5 1.5 0 004 13.5h2.5"/><path d="M10 5.2L12.8 8 10 10.8M12.8 8H6.5"/>',
  bell:'<path d="M4 11V7a4 4 0 118 0v4l1 1.5H3z"/><path d="M6.6 13.8a1.6 1.6 0 002.8 0"/>',
  mas:'<circle cx="3.5" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12.5" cy="8" r="1.2"/>',
  revision:'<path d="M4 2h5.5L13 5.5V14H4z"/><path d="M9.5 2v3.5H13"/><path d="M6.2 9.6l1.5 1.5 2.7-3"/>'
});

function saludoHora(){ const h = new Date().getHours(); return h<12 ? 'Buenos días' : (h<19 ? 'Buenas tardes' : 'Buenas noches'); }
function norm(s){ return String(s==null?'':s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(); }
function setBadge(id, n){ const b = document.getElementById(id); if(b) b.textContent = n>0 ? String(n) : ''; }
function irATab(k){ cerrarPops(); STATE.activeTab = k; STATE._animar = true; renderAdminTab(); window.scrollTo(0,0); }

function resumenDia(){
  const pend = STATE.solicitudes.filter(s=>s.estado==='pendiente').length;
  const atras = STATE.tareas.filter(isAtrasada).length;
  const hoy = STATE.tareas.filter(t=> t.estado!=='completada' && !isAtrasada(t) && diasParaVencer(t)===0).length;
  const partes = [];
  const rev = STATE.tareas.filter(t=>t.estado==='en_revision').length;
  if(rev) partes.push(`${rev} entrega${rev===1?'':'s'} por revisar`);
  if(pend) partes.push(`${pend} solicitud${pend===1?'':'es'} por revisar`);
  if(atras) partes.push(`${atras} tarea${atras===1?'':'s'} atrasada${atras===1?'':'s'}`);
  if(hoy) partes.push(`${hoy} que vence${hoy===1?'':'n'} hoy`);
  const pendU = pendUrg();
  if(pendU) partes.push(`${pendU} pendiente${pendU===1?'':'s'} tuyo${pendU===1?'':'s'} para hoy o atrasado${pendU===1?'':'s'}`);
  if(!partes.length) return 'Todo al día: no hay solicitudes pendientes ni tareas atrasadas.';
  return 'Tienes ' + partes.join(', ').replace(/, ([^,]*)$/, ' y $1') + '.';
}

function cerrarPops(){ document.querySelectorAll('.pop,.pop-scrim').forEach(e=>e.remove()); }
function abrirPop(anchor, html, cls){
  cerrarPops();
  const scrim = el('<div class="pop-scrim"></div>');
  const pop = el(`<div class="pop ${cls||''}" role="menu">${html}</div>`);
  document.body.append(scrim, pop);
  scrim.onclick = cerrarPops;
  if(anchor && window.innerWidth>900){
    const r = anchor.getBoundingClientRect();
    if(anchor.closest('.rail')){ pop.style.left = (r.right+14)+'px'; pop.style.bottom = Math.max(12, window.innerHeight-r.bottom-4)+'px'; }
    else { pop.style.top = (r.bottom+10)+'px'; pop.style.right = Math.max(12, window.innerWidth-r.right)+'px'; }
  }
  return pop;
}

function copiarLinkSolicitudes(){
  const url = location.origin + location.pathname + '?solicitar=1';
  const ok = ()=> toast('Link del formulario copiado');
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, ()=> toast(url)); else toast(url);
}
function accionesRapidas(){
  return [
    {t:'Nueva tarea',    i:'tareas',    f:()=>openTareaModal(null)},
    {t:'Nuevo proyecto', i:'proyectos', f:()=>openProyectoModal(null)},
    {t:'Nueva persona',  i:'talentos',  f:()=>openTalentoModal(null)},
    {t:'Nueva meta',     i:'metas',     f:()=>openMetaModal()},
    {t:'Copiar link del formulario de solicitudes', i:'links', f:copiarLinkSolicitudes}
  ];
}
function abrirMenuNuevo(anchor){
  const acc = accionesRapidas();
  const pop = abrirPop(anchor, `<div class="pop-title">Crear</div>` + acc.map((a,i)=>`<button type="button" class="pop-item" data-i="${i}"><span class="ic">${ico(a.i)}</span>${esc(a.t)}</button>`).join(''));
  pop.querySelectorAll('.pop-item').forEach(b=> b.onclick = ()=>{ cerrarPops(); acc[+b.dataset.i].f(); });
}
const TABS_ADMIN = [['dashboard','Resumen'],['solicitudes','Solicitudes'],['revision','Por revisar'],['pendientes','Mis pendientes'],['kanban','Tablero'],['semanas','Semanas'],['calendario','Calendario'],['talentos','Talentos'],['proyectos','Proyectos'],['tareas','Tareas'],['metas','Metas'],['links','Links y respaldo']];
function abrirMenuMas(anchor){
  const enDock = ['dashboard','solicitudes','kanban','tareas'];
  const otras = TABS_ADMIN.filter(([k])=>!enDock.includes(k));
  const html = `<div class="pop-title">Más secciones</div>`
    + otras.map(([k,l])=>{ const n = k==='revision' ? STATE.tareas.filter(t=>t.estado==='en_revision').length : (k==='pendientes' ? pendUrg() : 0); return `<button type="button" class="pop-item${STATE.activeTab===k?' activo':''}" data-k="${k}"><span class="ic">${ico(k)}</span>${esc(l)}${n?`<span class="nav-badge verde" style="margin-left:auto;position:static;">${n}</span>`:''}</button>`; }).join('')
    + `<button type="button" class="pop-item" data-k="_tema"><span class="ic">${ico('moon')}</span>Tema</button>`
    + `<button type="button" class="pop-item" data-k="_salir"><span class="ic">${ico('salir')}</span>Salir</button>`;
  const pop = abrirPop(anchor, html, 'malla');
  pop.querySelectorAll('.pop-item').forEach(b=> b.onclick = ()=>{
    const k = b.dataset.k;
    if(k==='_tema'){ cerrarPops(); toggleTheme(); }
    else if(k==='_salir'){ salirAdmin(); }
    else irATab(k);
  });
}
function alternarRail(){
  const c = !document.body.classList.contains('rail-c');
  document.body.classList.toggle('rail-c', c);
  try{ localStorage.setItem('equipo_rail', c?'1':'0'); }catch(e){}
  const b = document.getElementById('rail-toggle'); if(b){ b.setAttribute('aria-label', c?'Expandir menú':'Plegar menú'); b.setAttribute('data-tip', c?'Expandir menú':'Plegar menú'); }
}

/* Buscador: tareas, proyectos, personas, solicitudes y accesos directos */
function buscarParaPaleta(texto){
  const q = norm(texto).trim();
  const coincide = (...c)=> !q || c.some(x=> norm(x).includes(q));
  const ETQ = {pendiente:'Pendiente', en_progreso:'En progreso', en_revision:'En revisión', completada:'Completada'};
  const grupos = [];
  const acc = accionesRapidas().filter(a=>coincide(a.t, 'crear', 'nuevo', 'nueva'));
  if(acc.length) grupos.push({titulo:'Acciones', items:acc.map(a=>({t:a.t, i:a.i, f:a.f}))});
  if(q){
    const tareas = STATE.tareas.filter(t=>coincide(t.titulo, t.descripcion, t.tipo)).slice(0,6).map(t=>{
      const p = STATE.proyectos.find(x=>x.id===t.proyecto_id), w = STATE.talentos.find(x=>x.id===t.talento_id);
      const atr = isAtrasada(t);
      return {t:t.titulo, s:`${esc(w?w.nombre:'Sin asignar')} · ${esc(p?p.nombre:'Sin proyecto')}`, i:'tareas', tag: atr?'Atrasada':(ETQ[t.estado]||t.estado), tagCls: atr?'danger':(t.estado==='completada'?'ok':''), f:()=>openTareaModal(t.id)};
    });
    if(tareas.length) grupos.push({titulo:'Tareas', items:tareas});
    const proy = STATE.proyectos.filter(p=>coincide(p.nombre, p.marca)).slice(0,4).map(p=>({t:p.nombre, s:p.marca||'', i:'proyectos', f:()=>{ irATab('proyectos'); openProyectoModal(p.id); }}));
    if(proy.length) grupos.push({titulo:'Proyectos', items:proy});
    const pers = STATE.talentos.filter(t=>coincide(t.nombre, t.rol)).slice(0,4).map(t=>({t:t.nombre, s:t.rol||'', i:'talentos', f:()=>{ irATab('talentos'); openTalentoModal(t.id); }}));
    if(pers.length) grupos.push({titulo:'Personas', items:pers});
    const sol = STATE.solicitudes.filter(s=>coincide(s.asunto, s.area_solicitante, s.nombre_solicitante, s.descripcion)).slice(0,4).map(s=>({t:s.asunto, s:`${esc(s.area_solicitante||'')}${esc(s.nombre_solicitante?' · '+s.nombre_solicitante:'')}`, i:'solicitudes', tag: s.estado==='pendiente'?'Pendiente':'', f:()=>{ irATab('solicitudes'); openSolicitudDetalleModal(s.id); }}));
    if(sol.length) grupos.push({titulo:'Solicitudes', items:sol});
  }
  const ir = TABS_ADMIN.filter(([k,l])=>coincide(l, 'ir a')).map(([k,l])=>({t:l, s:'Ir a la sección', i:k, f:()=>irATab(k)}));
  if(ir.length) grupos.push({titulo:'Ir a', items: q ? ir.slice(0,4) : ir});
  return grupos;
}
function abrirPaleta(){
  if(STATE.mode!=='admin' || document.getElementById('cmdk')) return;
  cerrarPops();
  const ov = el(`<div class="cmdk-overlay" id="cmdk"><div class="cmdk" role="dialog" aria-modal="true" aria-label="Buscar en el equipo creativo">
    <div class="cmdk-in">${ico('search')}<input id="cmdk-q" type="text" placeholder="Busca una tarea, persona, proyecto o solicitud" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Buscar"><kbd>Esc</kbd></div>
    <div class="cmdk-list" id="cmdk-list" role="listbox"></div>
    <div class="cmdk-foot"><span><kbd>↑</kbd><kbd>↓</kbd>moverte</span><span><kbd>↵</kbd>abrir</span><span><kbd>Esc</kbd>cerrar</span></div></div></div>`);
  document.body.appendChild(ov);
  const q = $('#cmdk-q'), lista = $('#cmdk-list');
  let flat = [], sel = 0;
  const cerrar = ()=> ov.remove();
  const ejecutar = it=>{ cerrar(); try{ it.f(); }catch(e){ console.error(e); } };
  const marcar = ()=>{ lista.querySelectorAll('.cmdk-item').forEach(b=> b.classList.toggle('sel', +b.dataset.i===sel)); const s = lista.querySelector('.cmdk-item.sel'); if(s && s.scrollIntoView) s.scrollIntoView({block:'nearest'}); };
  const pintar = ()=>{
    flat = []; let html = '';
    buscarParaPaleta(q.value).forEach(g=>{
      html += `<div class="cmdk-group">${esc(g.titulo)}</div>`;
      g.items.forEach(it=>{
        const i = flat.push(it)-1;
        html += `<button type="button" class="cmdk-item${i===sel?' sel':''}" role="option" data-i="${i}"><span class="ic">${ico(it.i)}</span><span class="tx"><b>${esc(it.t)}</b>${it.s?`<small>${esc(it.s)}</small>`:''}</span>${it.tag?`<span class="pill ${it.tagCls||''}">${esc(it.tag)}</span>`:''}</button>`;
      });
    });
    if(!flat.length) html = `<div class="empty-state" style="padding:30px 16px;">No encontré nada para «${esc(q.value)}».</div>`;
    lista.innerHTML = html;
    lista.querySelectorAll('.cmdk-item').forEach(b=>{ b.onclick = ()=> ejecutar(flat[+b.dataset.i]); b.onmousemove = ()=>{ if(sel!==+b.dataset.i){ sel = +b.dataset.i; marcar(); } }; });
  };
  q.oninput = ()=>{ sel = 0; pintar(); };
  q.onkeydown = e=>{
    if(e.key==='ArrowDown'){ e.preventDefault(); sel = Math.min(flat.length-1, sel+1); marcar(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); sel = Math.max(0, sel-1); marcar(); }
    else if(e.key==='Enter'){ e.preventDefault(); if(flat[sel]) ejecutar(flat[sel]); }
    else if(e.key==='Escape'){ e.preventDefault(); cerrar(); }
  };
  ov.addEventListener('mousedown', e=>{ if(e.target===ov) cerrar(); });
  pintar(); q.focus();
}
let _atajosListos = false;
function activarAtajos(){
  if(_atajosListos) return; _atajosListos = true;
  document.addEventListener('keydown', e=>{
    if(STATE.mode!=='admin') return;
    const tag = (e.target && e.target.tagName) || '';
    const escribiendo = /INPUT|TEXTAREA|SELECT/.test(tag) || (e.target && e.target.isContentEditable);
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); abrirPaleta(); }
    else if(e.key==='/' && !escribiendo && !document.querySelector('.modal-overlay')){ e.preventDefault(); abrirPaleta(); }
    else if(e.key==='Escape'){ cerrarPops(); }
  });
}

function renderAdminApp(){
  let colapsada = window.innerWidth < 1180;
  try{ const g = localStorage.getItem('equipo_rail'); if(g!==null) colapsada = (g==='1'); }catch(e){}
  document.body.classList.add('tiene-dock');
  document.body.classList.toggle('rail-c', colapsada);
  const ini = initials(NOMBRE_ADMIN);
  const item = (k, label, cls)=> `<button type="button" class="rail-item" data-tab="${k}" data-tip="${label}">${ico(k,'rail-ico')}<span class="lbl">${label}</span><span class="nav-badge ${cls||''}" id="badge-${k}"></span></button>`;
  const dk = (k, label, cls)=> `<button type="button" class="dock-btn" data-tab="${k}" aria-label="${label}">${ico(k,'dock-ico')}<span>${label}</span><span class="nav-badge ${cls||''}" id="dbadge-${k}"></span></button>`;
  const tema = (cls)=> `<button type="button" class="theme-toggle ${cls}" data-accion="tema" title="Cambiar tema" aria-label="Cambiar tema claro/oscuro" data-tip="Tema claro / oscuro">${ico('moon','icon-moon rail-ico')}${ico('sun','icon-sun rail-ico')}</button>`;
  $('#app').innerHTML = `
    <div class="app-shell">
      <aside class="rail" aria-label="Navegación principal">
        <div class="rail-head">
          <div class="brand">${logoHTML(22)}</div>
          <button type="button" class="rail-toggle" id="rail-toggle" aria-label="${colapsada?'Expandir menú':'Plegar menú'}" data-tip="${colapsada?'Expandir menú':'Plegar menú'}">${ico('chevL')}</button>
        </div>
        <div class="rail-profile">
          <span class="rail-avatar">${esc(ini)}</span>
          <div class="rp-text"><b>${esc(NOMBRE_ADMIN)}</b><span>Administrador</span></div>
        </div>
        <nav class="rail-nav" aria-label="Secciones">
          <div class="rail-group"><div class="rail-label">Trabajo</div>
            ${item('dashboard','Resumen')}${item('solicitudes','Solicitudes')}${item('revision','Por revisar','verde')}${item('pendientes','Mis pendientes')}${item('kanban','Tablero')}${item('semanas','Semanas')}${item('calendario','Calendario')}
          </div>
          <div class="rail-group"><div class="rail-label">Equipo</div>
            ${item('talentos','Talentos')}${item('proyectos','Proyectos')}${item('tareas','Tareas','danger')}${item('metas','Metas')}
          </div>
          <div class="rail-group"><div class="rail-label">Sistema</div>
            ${item('links','Links y respaldo')}
          </div>
        </nav>
        <div class="rail-actions">
          ${tema('rail-act')}
          <button type="button" class="rail-act" id="rail-ajustes" aria-label="Links y respaldo" data-tip="Links y respaldo">${ico('ajustes','rail-ico')}</button>
          <button type="button" class="rail-act" id="rail-nuevo" aria-label="Crear" data-tip="Crear">${ico('plus','rail-ico')}</button>
          <button type="button" class="rail-act" id="rail-salir" aria-label="Salir" data-tip="Salir">${ico('salir','rail-ico')}</button>
        </div>
      </aside>
      <div class="shell-main">
        <header class="cmdbar">
          <span class="cmd-mono only-mobile">${esc(ini)}</span>
          <div class="cmd-hello"><span>Equipo creativo</span><b id="cmd-seccion">Resumen</b></div>
          <button type="button" class="cmd-field" id="cmd-abrir" aria-label="Buscar">${ico('search')}<span>Buscar tareas, personas, proyectos…</span><kbd>Ctrl K</kbd></button>
          <div class="cmd-right">
            <button type="button" class="cmd-btn" id="cmd-campana" aria-label="Solicitudes pendientes">${ico('bell')}<span class="dotn" id="bell-n"></span></button>
            ${tema('cmd-btn only-mobile')}
            <button type="button" class="btn cmd-new not-mobile" id="cmd-nuevo">${ico('plus')} Nuevo</button>
          </div>
        </header>
        <main>
          <div class="view" id="view-dashboard"></div>
          <div class="view" id="view-solicitudes"></div>
          <div class="view" id="view-revision"></div>
          <div class="view" id="view-pendientes"></div>
          <div class="view" id="view-kanban"></div>
          <div class="view" id="view-semanas"></div>
          <div class="view" id="view-calendario"></div>
          <div class="view" id="view-talentos"></div>
          <div class="view" id="view-proyectos"></div>
          <div class="view" id="view-tareas"></div>
          <div class="view" id="view-metas"></div>
          <div class="view" id="view-links"></div>
        </main>
      </div>
      <nav class="dock" aria-label="Secciones">
        ${dk('dashboard','Resumen')}${dk('solicitudes','Solicitudes')}${dk('kanban','Tablero')}${dk('tareas','Tareas','danger')}
        <button type="button" class="dock-btn" id="dock-mas" aria-label="Más secciones">${ico('mas','dock-ico')}<span>Más</span><span class="nav-badge verde" id="dbadge-mas"></span></button>
        <button type="button" class="dock-plus" id="dock-nuevo" aria-label="Crear">${ico('plus')}</button>
      </nav>
    </div>`;
  document.querySelectorAll('[data-tab]').forEach(b=>{ b.onclick = ()=> irATab(b.dataset.tab); });
  $('#rail-toggle').onclick = alternarRail;
  $('#rail-ajustes').onclick = ()=> irATab('links');
  $('#rail-nuevo').onclick = e=> abrirMenuNuevo(e.currentTarget);
  $('#rail-salir').onclick = salirAdmin;
  $('#cmd-abrir').onclick = abrirPaleta;
  $('#cmd-campana').onclick = ()=> irATab('solicitudes');
  $('#cmd-nuevo').onclick = e=> abrirMenuNuevo(e.currentTarget);
  $('#dock-mas').onclick = e=> abrirMenuMas(e.currentTarget);
  $('#dock-nuevo').onclick = e=> abrirMenuNuevo(e.currentTarget);
  activarAtajos();
  STATE.activeTab = 'dashboard';
  STATE._animar = true;
  renderAdminTab();
}

function renderAdminTab(){
  const act = STATE.activeTab;
  document.querySelectorAll('[data-tab]').forEach(t=> t.classList.toggle('active', t.dataset.tab===act));
  const mas = $('#dock-mas'); if(mas) mas.classList.toggle('active', !['dashboard','solicitudes','kanban','tareas'].includes(act));
  const pend = STATE.solicitudes.filter(s=>s.estado==='pendiente').length;
  const atras = STATE.tareas.filter(isAtrasada).length;
  setBadge('badge-solicitudes', pend); setBadge('dbadge-solicitudes', pend); setBadge('bell-n', pend);
  setBadge('badge-tareas', atras); setBadge('dbadge-tareas', atras);
  const porRev = STATE.tareas.filter(t=>t.estado==='en_revision').length;
  const pendU = pendUrg();
  setBadge('badge-revision', porRev); setBadge('badge-pendientes', pendU); setBadge('dbadge-mas', porRev + pendU);
  const sec = $('#cmd-seccion'); if(sec){ const t = TABS_ADMIN.find(x=>x[0]===act); sec.textContent = t ? t[1] : ''; }
  document.querySelectorAll('.view').forEach(v=> v.classList.remove('active'));
  const view = $('#view-'+act);
  if(view){
    view.classList.add('active'); view.classList.remove('anim');
    if(STATE._animar){ void view.offsetWidth; view.classList.add('anim'); STATE._animar = false; }
  }

  if(act==='dashboard') renderAdminDashboard();
  if(act==='solicitudes') renderAdminSolicitudes();
  if(act==='revision') renderAdminRevision();
  if(act==='pendientes') renderAdminPendientes();
  if(act==='kanban') renderAdminKanbanTab();
  if(act==='semanas') renderAdminSemanas();
  if(act==='calendario') renderCalendario();
  if(act==='talentos') renderAdminTalentos();
  if(act==='proyectos') renderAdminProyectos();
  if(act==='tareas') renderAdminTareas();
  if(act==='metas') renderAdminMetas();
  if(act==='links') renderAdminLinks();
}

window.__ARCHIVO_ADMIN = !!(document.currentScript && document.currentScript.dataset.archivo === 'admin');

/* ============================================================
   FLUJO POR ETAPAS
   El aprendiz mueve su tarea (con su clave de 4 dígitos):
   Pendiente → En progreso → En revisión.
   Solo el administrador la aprueba (Completada).
   Cada paso guarda fecha y hora, en hora de Colombia.
   ============================================================ */
const ZONA_CO = 'America/Bogota';
const ETAPAS = [['pendiente','Pendiente'],['en_progreso','En progreso'],['en_revision','En revisión'],['completada','Aprobada']];
const CLAVE_DE_ETIQUETA = {'Pendiente':'pendiente','En progreso':'en_progreso','En revisión':'en_revision','Completada':'completada','Bloqueada':'bloqueada'};
Object.assign(ICONS,{descargar:'<path d="M8 2.5v7.5M4.8 7.2L8 10.4l3.2-3.2M3 13h10"/>'});
const ETIQUETA_DE_CLAVE = {pendiente:'Pendiente', en_progreso:'En progreso', en_revision:'En revisión', completada:'Completada', bloqueada:'Bloqueada'};

/* ---------- fechas y horas (siempre hora de Colombia) ---------- */
function _sinEspaciosRaros(s){ return String(s).replace(/[\u202f\u00a0]/g,' '); }
function diaCO(iso){ return new Date(iso).toLocaleDateString('en-CA',{timeZone:ZONA_CO}); }
function horaCO(iso){ return _sinEspaciosRaros(new Date(iso).toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:ZONA_CO})); }
function diaCortoCO(iso){
  const d = diaCO(iso), hoy = diaCO(new Date().toISOString()), ayer = diaCO(new Date(Date.now()-864e5).toISOString());
  if(d===hoy) return 'hoy';
  if(d===ayer) return 'ayer';
  const op = {weekday:'short', day:'numeric', month:'short', timeZone:ZONA_CO};
  if(d.slice(0,4)!==hoy.slice(0,4)) op.year = 'numeric';
  return _sinEspaciosRaros(new Date(iso).toLocaleDateString('es-CO',op)).replace(/[.,]/g,'').replace(/\s+/g,' ').trim();
}
function momentoCO(iso){ return iso ? `${diaCortoCO(iso)} · ${horaCO(iso)}` : '—'; }
function haceCO(iso){
  const m = Math.round((Date.now()-new Date(iso).getTime())/60000);
  if(m<1) return 'hace un momento';
  if(m<60) return `hace ${m} min`;
  const h = Math.floor(m/60); if(h<24) return `hace ${h} h`;
  return `hace ${Math.floor(h/24)} d`;
}
function duracionCO(ms){
  const m = Math.round(ms/60000);
  if(m<1) return 'menos de 1 min';
  if(m<60) return `${m} min`;
  const h = Math.floor(m/60), mm = m%60;
  if(h<24) return mm ? `${h} h ${mm} min` : `${h} h`;
  const d = Math.floor(h/24), hh = h%24;
  return hh ? `${d} d ${hh} h` : `${d} d`;
}

/* ---------- historial de una tarea, leído de los avances ---------- */
function eventosDe(t){
  const ev = [];
  if(t.created_at) ev.push({k:'creada', iso:t.created_at, autor:'', a:'pendiente', txt:'', url:''});
  STATE.avances.filter(x=>x.tarea_id===t.id).forEach(x=>{
    const d = x.descripcion || '';
    const e = {iso:x.created_at, autor:x.autor||'', url:x.archivo_url||'', txt:'', id:x.id};
    let m;
    if((m = /^Estado cambiado:\s*(.+?)\s*→\s*(.+?)\s*$/.exec(d))){ e.k='estado'; e.de = CLAVE_DE_ETIQUETA[m[1]]||m[1]; e.a = CLAVE_DE_ETIQUETA[m[2]]||m[2]; }
    else if(/^Devuelto para corrección:/.test(d)){ e.k='devuelta'; e.txt = d.replace(/^Devuelto para corrección:\s*/,''); }
    else if(/^Nota de entrega:/.test(d)){ e.k='entrega'; e.txt = d.replace(/^Nota de entrega:\s*/,''); }
    else if(/^Observación de la revisión:/.test(d)){ e.k='obs'; e.txt = d.replace(/^Observación de la revisión:\s*/,''); }
    else { e.k='nota'; e.txt = d; }
    ev.push(e);
  });
  return ev.sort((a,b)=> new Date(a.iso)-new Date(b.iso));
}
function ultimoEvento(ev, fn){ for(let i=ev.length-1;i>=0;i--) if(fn(ev[i])) return ev[i]; return null; }
function autorVisible(e){ const a = String(e.autor||'').replace(/\s*\((aprob[óo]|aprobado)\)\s*$/i,'').trim(); return /^jhojan\b/i.test(a) ? NOMBRE_ADMIN : a; }   // los registros viejos que dicen "Jhojan" se muestran como "Jefe"
function tituloEvento(e){
  if(e.k==='creada') return 'Tarea creada';
  if(e.k==='estado'){
    if(e.a==='completada') return 'Aprobada';
    if(e.a==='en_revision') return 'Enviada a revisión';
    if(e.a==='en_progreso') return e.de==='pendiente' ? 'Empezó (En progreso)' : (e.de==='en_revision' ? 'Volvió a En progreso' : 'Pasó a En progreso');
    return 'Pasó a ' + (ETIQUETA_DE_CLAVE[e.a]||e.a);
  }
  if(e.k==='devuelta') return 'Devuelta para corregir';
  if(e.k==='entrega') return 'Nota de entrega';
  if(e.k==='obs') return 'Observación de la revisión';
  return 'Nota';
}
function lineaTiempoHTML(t){
  const ev = eventosDe(t);
  if(!ev.length) return '<div class="empty-state" style="padding:8px;">Sin movimientos todavía.</div>';
  let prev = null;
  return '<ol class="tl">' + ev.map(e=>{
    const sub = [];
    const a = autorVisible(e);
    if(a && a!=='Sistema' && !(e.k==='estado' && e.a==='completada')) sub.push('por ' + esc(a));
    if(prev && ['estado','devuelta'].includes(e.k)){ const ms = new Date(e.iso)-new Date(prev.iso); if(ms>=60000) sub.push('tras ' + duracionCO(ms)); }
    if(['estado','creada','devuelta'].includes(e.k)) prev = e;
    const archivo = e.url && urlSegura(e.url) ? `<a class="tl-file" href="${esc(urlSegura(e.url))}" target="_blank" rel="noopener">${ico('link')} Ver archivo</a>` : '';
    return `<li class="tl-item k-${e.k}"><span class="tl-dot"></span><div class="tl-body">
      <div class="tl-top"><b>${esc(tituloEvento(e))}</b><time datetime="${esc(e.iso)}">${esc(momentoCO(e.iso))}</time></div>
      ${sub.length?`<div class="tl-sub">${sub.join(' · ')}</div>`:''}
      ${e.txt?`<div class="tl-txt">${esc(e.txt)}</div>`:''}${archivo}
    </div></li>`;
  }).join('') + '</ol>';
}
// Cuándo entregó de verdad el aprendiz: la última vez que envió a revisión (no cuándo aprobaste tú).
function entregaRealDe(t){
  const ev = eventosDe(t).filter(e=>e.k==='estado');
  const fin = ultimoEvento(ev, e=>e.a==='completada');
  const env = ultimoEvento(ev, e=>e.a==='en_revision' && (!fin || new Date(e.iso)<=new Date(fin.iso)));
  if(env) return new Date(env.iso);
  if(fin) return new Date(fin.iso);
  return t.updated_at ? new Date(t.updated_at) : null;
}
function etapasDe(t){
  const ev = eventosDe(t);
  const act = Math.max(0, ETAPAS.findIndex(([k])=>k===t.estado));
  return ETAPAS.map(([k,l],i)=>{
    const e = k==='pendiente' ? ev.find(x=>x.k==='creada') : ultimoEvento(ev, x=>x.k==='estado' && x.a===k);
    const alcanzada = i<=act;
    return {k, l, alcanzada, actual:i===act, iso: alcanzada && e ? e.iso : null};
  });
}
function stepperHTML(t){
  return '<ol class="stepper" aria-label="Etapas de la tarea">' + etapasDe(t).map(s=>{
    const check = s.alcanzada && (!s.actual || s.k==='completada');
    return `<li class="st${s.alcanzada?' hecho':''}${s.actual?' actual':''}"><span class="dot">${check?ico('check'):''}</span><b>${s.l}</b>${s.iso?`<small>${esc(diaCortoCO(s.iso))}</small><small>${esc(horaCO(s.iso))}</small>`:'<small>&nbsp;</small><small>&nbsp;</small>'}</li>`;
  }).join('') + '</ol>';
}

/* ---------- claves de aprendiz ---------- */
async function cargarClaves(){
  if(STATE.mode!=='admin' && STATE.mode!=='aprendiz') return;
  try{ const r = await supa.rpc('claves_estado'); STATE.clavesOk = !r.error; STATE.claves = (r && r.data) || []; }
  catch(e){ STATE.clavesOk = false; STATE.claves = []; }
}
function tieneClave(id){ return Array.isArray(STATE.claves) && STATE.claves.includes(id); }
function claveGuardada(id){
  try{ const g = sessionStorage.getItem('equipo_pin_'+id) || localStorage.getItem('equipo_pin_'+id); if(g) return g; }catch(e){}
  return (STATE._pins && STATE._pins[id]) || '';
}
function guardarClave(id, pin, recordar){
  STATE._pins = STATE._pins || {}; STATE._pins[id] = pin;
  try{ sessionStorage.setItem('equipo_pin_'+id, pin); if(recordar) localStorage.setItem('equipo_pin_'+id, pin); }catch(e){}
}
function olvidarClave(id){
  if(STATE._pins) delete STATE._pins[id];
  try{ sessionStorage.removeItem('equipo_pin_'+id); localStorage.removeItem('equipo_pin_'+id); }catch(e){}
}
function soloDigitos(input){
  // los números se ocultan con CSS; si el navegador no lo soporta (p. ej. Firefox) se usa un campo de contraseña
  try{ if(!(window.CSS && CSS.supports && CSS.supports('-webkit-text-security','disc'))) input.type = 'password'; }catch(_){ input.type = 'password'; }
  input.addEventListener('input', ()=>{ input.value = input.value.replace(/\D/g,'').slice(0,4); }); }
function textoErrorMovimiento(r){
  switch(r && r.error){
    case 'clave': return `Clave incorrecta. Te ${r.restantes===1?'queda':'quedan'} ${r.restantes} intento${r.restantes===1?'':'s'}.`;
    case 'bloqueado': return `Demasiados intentos. Vuelve a intentar en ${r.minutos} min, o pídele al jefe que restablezca tu clave.`;
    case 'sin_clave': return `Aún no tienes clave. Pídele al jefe que te la cree.`;
    case 'link': return 'El link debe empezar por https:// y no tener espacios.';
    case 'tarea': case 'transicion': return 'Esta tarea cambió mientras tanto. Ya actualicé la lista; revisa y vuelve a intentar.';
    case 'acceso': return `Tu acceso está desactivado. Habla con el jefe.`;
    case 'falta': return 'Esta función todavía no está activada en Supabase (falta correr la migración v8).';
    default: return 'No se pudo guardar. Revisa tu conexión e intenta de nuevo.';
  }
}
async function llamarMover(talento, t, destino, pin, nota, link){
  try{
    const r = await supa.rpc('aprendiz_mover_tarea', {p_talento:talento.id, p_pin:pin, p_tarea:t.id, p_estado:destino, p_nota:nota||null, p_link:link||null});
    if(r.error){
      const falta = /PGRST202|42883|could not find the function|does not exist/i.test((r.error.code||'')+' '+(r.error.message||''));
      return {ok:false, error: falta ? 'falta' : 'red'};
    }
    return r.data || {ok:false, error:'red'};
  }catch(e){ return {ok:false, error:'red'}; }
}
function mensajeExitoMovimiento(t, destino){
  const ahora = new Date().toISOString();
  if(destino==='en_revision') return `Enviada a revisión (${momentoCO(ahora)}). El jefe la revisará.`;
  if(t.estado==='en_revision') return `Retirada de revisión (${momentoCO(ahora)}).`;
  return `Empezaste esta tarea (${momentoCO(ahora)}).`;
}
function iniciarMovimiento(talento, tareaId, destino){
  const t = STATE.tareas.find(x=>x.id===tareaId); if(!t) return;
  const pin = claveGuardada(talento.id);
  if(destino==='en_revision' || !pin){ abrirModalMovimiento(talento, t, destino); return; }
  llamarMover(talento, t, destino, pin, '', '').then(async r=>{
    if(r.ok){ await loadAll(); renderAprendizView(); toast(esc(mensajeExitoMovimiento(t, destino))); return; }
    if(r.error==='clave') olvidarClave(talento.id);
    if(r.error==='tarea' || r.error==='transicion'){ await loadAll(); renderAprendizView(); toast(esc(textoErrorMovimiento(r))); return; }
    abrirModalMovimiento(talento, t, destino, textoErrorMovimiento(r));
  });
}
function abrirModalMovimiento(talento, t, destino, errorInicial){
  document.querySelectorAll('.modal-overlay.mv').forEach(x=>x.remove());
  const entrega = destino==='en_revision';
  const pinGuardado = claveGuardada(talento.id);
  const titulo = entrega ? 'Enviar a revisión' : (t.estado==='en_revision' ? 'Retirar de revisión' : 'Empezar tarea');
  const boton  = entrega ? 'Enviar a revisión' : (t.estado==='en_revision' ? 'Retirar' : 'Empezar');
  const ov = el(`<div class="modal-overlay mv"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(titulo)}">
    <h3>${esc(titulo)}</h3>
    <p class="mv-tarea">${esc(t.titulo)}</p>
    ${entrega ? `<div class="field"><label for="mv-nota">Nota para el jefe (opcional)</label><textarea id="mv-nota" maxlength="800" placeholder="Qué hiciste y qué debe revisar…"></textarea></div>
    <div class="field"><label for="mv-link">Link del archivo final (opcional)</label><input id="mv-link" type="url" inputmode="url" autocomplete="off" placeholder="https://…"></div>` : ''}
    ${pinGuardado ? '' : `<div class="field"><label for="mv-pin">Tu clave de 4 dígitos</label><input id="mv-pin" class="pin-input" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="••••"><label class="chk"><input type="checkbox" id="mv-rec"> Recordar en este dispositivo</label></div>`}
    <div class="form-error" id="mv-error" role="alert">${esc(errorInicial||'')}</div>
    <div class="modal-actions"><button type="button" class="btn secondary" id="mv-cancel">Cancelar</button><button type="button" class="btn" id="mv-ok">${esc(boton)}</button></div>
  </div></div>`);
  document.body.appendChild(ov);
  const pinEl = $('#mv-pin', ov), err = $('#mv-error', ov), ok = $('#mv-ok', ov);
  if(pinEl) soloDigitos(pinEl);
  ov.addEventListener('input', ()=>{ err.textContent = ''; });
  $('#mv-cancel', ov).onclick = ()=> ov.remove();
  ov.addEventListener('mousedown', e=>{ if(e.target===ov) ov.remove(); });
  const enviar = async ()=>{
    const pin = pinGuardado || (pinEl ? pinEl.value : '');
    if(!/^\d{4}$/.test(pin)){ err.textContent = 'Escribe tu clave de 4 dígitos.'; if(pinEl) pinEl.focus(); return; }
    const nota = $('#mv-nota', ov) ? $('#mv-nota', ov).value.trim() : '';
    const link = $('#mv-link', ov) ? $('#mv-link', ov).value.trim() : '';
    err.textContent = ''; ok.disabled = true; const txt = ok.textContent; ok.textContent = 'Guardando…';
    const r = await llamarMover(talento, t, destino, pin, nota, link);
    if(r.ok){
      guardarClave(talento.id, pin, !!($('#mv-rec', ov) && $('#mv-rec', ov).checked));
      ov.remove(); await loadAll(); renderAprendizView(); toast(esc(mensajeExitoMovimiento(t, destino))); return;
    }
    if(r.error==='clave'){
      olvidarClave(talento.id);
      if(pinGuardado){ ov.remove(); abrirModalMovimiento(talento, t, destino, textoErrorMovimiento(r)); return; }
      if(pinEl){ pinEl.value=''; pinEl.focus(); }
    }
    if(r.error==='tarea' || r.error==='transicion'){ ov.remove(); await loadAll(); renderAprendizView(); toast(esc(textoErrorMovimiento(r))); return; }
    err.textContent = textoErrorMovimiento(r); ok.disabled = false; ok.textContent = txt;
  };
  ok.onclick = enviar;
  ov.addEventListener('keydown', e=>{ if(e.key==='Enter' && e.target.tagName!=='TEXTAREA'){ e.preventDefault(); enviar(); } else if(e.key==='Escape') ov.remove(); });
  setTimeout(()=>{ const f = pinEl || $('#mv-nota', ov) || ok; if(f && f.focus) f.focus(); }, 60);
}

/* ---------- vista del aprendiz ---------- */
function accionesAprendizHTML(t, talento, puedeMover){
  const e = t.estado;
  if(e==='completada'){
    const ap = ultimoEvento(eventosDe(t), x=>x.k==='estado' && x.a==='completada');
    return ap ? `<div class="aprobada-box">${ico('check')}<div><b>Aprobada</b><span>${esc(momentoCO(ap.iso))}</span></div></div>` : '';
  }
  if(!puedeMover) return '';
  if(e==='pendiente')   return `<div class="task-actions"><button type="button" class="btn" data-mover="${t.id}" data-a="en_progreso">Empezar</button></div>`;
  if(e==='en_progreso') return `<div class="task-actions"><button type="button" class="btn" data-mover="${t.id}" data-a="en_revision">Enviar a revisión</button></div>`;
  if(e==='en_revision') return `<div class="task-actions"><span class="espera">${ico('clock')} Esperando revisión del jefe</span><button type="button" class="btn secondary small" data-mover="${t.id}" data-a="en_progreso">Retirar de revisión</button></div>`;
  return '';
}
function devueltaPendiente(t){
  if(t.estado!=='en_progreso') return null;
  const ev = eventosDe(t);
  const dev = ultimoEvento(ev, e=>e.k==='devuelta');
  if(!dev) return null;
  const env = ultimoEvento(ev, e=>e.k==='estado' && e.a==='en_revision');
  return (!env || new Date(dev.iso) >= new Date(env.iso)) ? dev : null;
}

function renderAprendizVista(){
  const talento = STATE.talentos.find(t=> t.id===STATE.talentoId || t.nombre.toLowerCase()===decodeURIComponent(STATE.talentoId).toLowerCase());
  if(!talento){
    $('#app').innerHTML = `<div class="gate"><div class="gate-card"><div class="crown-big">${logoHTML(44)}</div><h2>Link no válido</h2><p>No encontramos este acceso. Verifica tu link con el administrador.</p></div></div>`;
    return;
  }
  if(talento.acceso_habilitado === false){
    $('#app').innerHTML = `<div class="gate"><div class="gate-card"><div class="crown-big">${logoHTML(44)}</div><h2>Acceso desactivado</h2><p>Tu acceso a este panel fue desactivado. Contacta al administrador si crees que es un error.</p></div></div>`;
    return;
  }
  const misTareas = STATE.tareas.filter(t=>t.talento_id===talento.id);
  const activas = tareasActivasDe(talento.id).length;
  const atrasadas = tareasAtrasadasDe(talento.id);
  const cumpl = cumplimientoDe(talento.id);
  const tProm = tiempoPromedioEntrega(talento.id);
  const puedeMover = !!STATE.clavesOk && tieneClave(talento.id);
  const porRevisar = misTareas.filter(t=>t.estado==='en_revision').length;

  const hoy = hoyStr(), sem = rangoSemana(0);
  const porFecha = (a,b)=> (a.fecha_entrega||'9999-12-31').localeCompare(b.fecha_entrega||'9999-12-31');
  const grupos = {urgentes:[], semana:[], despues:[], hechas:[]};
  misTareas.forEach(t=>{
    if(t.estado==='completada') grupos.hechas.push(t);
    else if(t.fecha_entrega && t.fecha_entrega<=hoy) grupos.urgentes.push(t);
    else if(t.fecha_entrega && t.fecha_entrega<=sem.fin) grupos.semana.push(t);
    else grupos.despues.push(t);
  });
  Object.values(grupos).forEach(g=>g.sort(porFecha));
  grupos.hechas.reverse();
  STATE._histAbiertos = STATE._histAbiertos || new Set();

  const tarjeta = t=>{
    const proy = STATE.proyectos.find(p=>p.id===t.proyecto_id);
    const hecha = t.estado==='completada';
    const notas = eventosDe(t).filter(e=>e.k==='nota' || e.k==='obs').reverse();
    const dev = devueltaPendiente(t);
    let due = '';
    if(t.fecha_entrega){
      const d = diasParaVencer(t), tarde = !hecha && isAtrasada(t);
      let txt = fmtCorta(t.fecha_entrega);
      if(!hecha){ if(tarde) txt = 'Atrasada · '+txt; else if(d===0) txt = 'Hoy'; else if(d===1) txt = 'Mañana'; }
      due = `<span class="due ${tarde?'late':(!hecha&&d===0?'today':'')}">${txt}</span>`;
    }
    const prio = (t.prioridad==='alta'||t.prioridad==='urgente') && !hecha ? pillPrioridad(t.prioridad) : '';
    return `<article class="task-card" style="${proy&&proy.color?`--brand:${colorSeguro(proy.color)};`:''}">
      <div class="task-head"><h4>${esc(t.titulo)}</h4>${due}</div>
      <div class="task-sub">${esc(proy?proy.nombre:'Sin proyecto')}${t.tipo?' · '+esc(t.tipo):''}</div>
      ${t.descripcion?`<div class="task-desc">${esc(t.descripcion)}</div>`:''}
      ${materialHTML(materialDeTarea(t), 'Material para trabajar')}
      ${dev?`<div class="devuelta-box" role="alert"><b>El jefe la devolvió para corregir</b><span>${esc(momentoCO(dev.iso))}</span><p>${esc(dev.txt)}</p></div>`:''}
      ${stepperHTML(t)}
      ${accionesAprendizHTML(t, talento, puedeMover)}
      <div class="task-foot">${pillEstadoTarea(t)}${prio}${t.fecha_entrega && !hecha?`<button class="btn secondary small" data-ics="${t.id}">${ico('cal')} Agregar a calendario</button>`:''}</div>
      ${notas.length?`<div class="task-notes">${notas.map(a=>`<div class="avance-item">${esc(a.txt)}<div class="meta-line">${esc(autorVisible(a)||'Administrador')} · ${esc(momentoCO(a.iso))}${a.url && urlSegura(a.url)?` · <a href="${esc(urlSegura(a.url))}" target="_blank" rel="noopener">Ver archivo</a>`:''}</div></div>`).join('')}</div>`:''}
      <details class="hist" data-hist="${t.id}"${STATE._histAbiertos.has(t.id)?' open':''}><summary>Historial con fecha y hora</summary>${lineaTiempoHTML(t)}</details>
    </article>`;
  };
  const seccion = (titulo, lista)=> lista.length ? `<section><h3 class="group-title">${titulo}<span class="count">${lista.length}</span></h3>${lista.map(tarjeta).join('')}</section>` : '';
  const cuerpo = misTareas.length===0
    ? `<div class="empty-state" style="background:var(--panel);border:1px solid var(--line);border-radius:var(--r-md);">Aún no tienes tareas asignadas. Cuando te asignen una, aparecerá aquí.</div>`
    : seccion('Atrasadas y para hoy', grupos.urgentes) + seccion('Esta semana', grupos.semana) + seccion('Más adelante', grupos.despues)
      + (grupos.hechas.length ? `<details class="done-group"><summary>Aprobadas<span class="count">${grupos.hechas.length}</span></summary><div class="task-list">${grupos.hechas.map(tarjeta).join('')}</div></details>` : '');

  const aviso = !STATE.clavesOk
    ? `<div class="aviso-clave">${ico('lock')}<span>Para mover tus tareas falta activar la clave en Supabase. Avísale al jefe.</span></div>`
    : (!tieneClave(talento.id) ? `<div class="aviso-clave">${ico('lock')}<span>Aún no tienes clave. Pídele al jefe que te cree tu clave de 4 dígitos para poder empezar y enviar tus tareas.</span></div>` : '');

  $('#app').innerHTML = `
    <div class="topbar">
      <div class="brand">${logoHTML(28)}<div class="sub">Mis tareas</div></div>
      <div class="topbar-actions">${esStandalone() ? '' : `<button type="button" class="btn small inst-btn" id="apr-instalar" aria-label="Instalar la app en este dispositivo">${ico('descargar')}<span>Instalar app</span></button>`}${themeToggleHTML()}<span class="mode-badge mb-apr">Vista aprendiz</span></div>
    </div>
    <main>
      <span class="readonly-badge">${ico('check')} Tú mueves la tarea, el jefe la aprueba</span>
      <div class="profile-row">
        <div class="avatar">${esc(talento.avatar_inicial || initials(talento.nombre))}</div>
        <div>
          <div class="person-name">${esc(talento.nombre)}</div>
          <div class="person-role">${esc(talento.rol)}</div>
        </div>
      </div>
      ${aviso}
      <div class="grid-cards">
        <div class="card"><div class="label">Tareas activas</div><div class="value">${activas}</div></div>
        <div class="card"><div class="label">Atrasadas</div><div class="value ${atrasadas>0?'danger':''}">${atrasadas}</div></div>
        <div class="card"><div class="label">Cumplimiento</div><div class="value">${cumpl===null?'—':cumpl+'%'}</div></div>
        <div class="card"><div class="label">Tiempo de entrega</div><div class="value" style="font-size:17px;line-height:1.3;">${labelTiempoPromedio(tProm)}</div></div>
      </div>
      <div id="mis-tareas">${cuerpo}</div>
    </main>`;
  document.querySelectorAll('[data-ics]').forEach(b=> b.onclick = ()=> descargarICS(misTareas.find(x=>x.id===b.dataset.ics)));
  document.querySelectorAll('[data-mover]').forEach(b=> b.onclick = ()=> iniciarMovimiento(talento, b.dataset.mover, b.dataset.a));
  const bInst = $('#apr-instalar'); if(bInst) bInst.onclick = ()=> instalarApp();
  document.querySelectorAll('details.hist').forEach(d=> d.addEventListener('toggle', ()=>{ if(d.open) STATE._histAbiertos.add(d.dataset.hist); else STATE._histAbiertos.delete(d.dataset.hist); }));
}

/* ---------- administrador: revisar y aprobar ---------- */
async function registrarCambioEstado(tareaId, estadoAnterior, estadoNuevo, autor){
  if(estadoAnterior===estadoNuevo) return;
  await supa.from('avances').insert({
    tarea_id: tareaId,
    descripcion: `Estado cambiado: ${LABELS_ESTADO[estadoAnterior]||estadoAnterior} → ${LABELS_ESTADO[estadoNuevo]||estadoNuevo}`,
    autor: autor || (STATE.mode==='admin' ? NOMBRE_ADMIN : 'Sistema')
  });
}
function textoPuntualidad(t, envioIso){
  if(!t.fecha_entrega || !envioIso) return '';
  const dias = Math.round((new Date(diaCO(envioIso)+'T00:00:00') - new Date(t.fecha_entrega+'T00:00:00'))/864e5);
  if(dias<=0) return 'a tiempo';
  return `${dias} día${dias===1?'':'s'} después de la fecha de entrega`;
}
function abrirAprobacion(tareaId){
  const t = STATE.tareas.find(x=>x.id===tareaId); if(!t) return;
  document.querySelectorAll('.modal-overlay.rv').forEach(x=>x.remove());
  const ev = eventosDe(t);
  const enRev = t.estado==='en_revision';
  const envio = ultimoEvento(ev, e=>e.k==='estado' && e.a==='en_revision');
  const entrega = envio ? ultimoEvento(ev, e=>e.k==='entrega' && new Date(e.iso) >= new Date(envio.iso)-5000) : null;
  const link = t.link_archivo && urlSegura(t.link_archivo) ? urlSegura(t.link_archivo) : '';
  const punt = enRev && envio ? textoPuntualidad(t, envio.iso) : '';
  const ov = el(`<div class="modal-overlay rv"><div class="modal" role="dialog" aria-modal="true" aria-label="Revisar entrega">
    <h3>${enRev?'Revisar entrega':'Aprobar tarea'}</h3>
    <div class="rv-top"><b>${esc(t.titulo)}</b><span>${esc(talentoNombre(t.talento_id))} · ${esc(proyectoNombre(t.proyecto_id))}</span>${pillEstadoTarea(t)}</div>
    ${enRev && envio ? `<p class="rv-envio">${ico('clock')} Enviada <b>${esc(momentoCO(envio.iso))}</b> <span>(${esc(haceCO(envio.iso))})</span>${punt?` · <span class="${punt==='a tiempo'?'rv-ok':'rv-late'}">${esc(punt)}</span>`:''}</p>` : ''}
    ${!enRev ? `<p class="rv-aviso">Esta tarea no está «En revisión» (está en ${esc(ETIQUETA_DE_CLAVE[t.estado]||t.estado)}). Puedes aprobarla igual; quedará registrado que la aprobaste ahora.</p>` : ''}
    ${entrega ? `<div class="avance-item"><b>Nota del aprendiz</b><br>${esc(entrega.txt)}</div>` : ''}
    ${link ? `<p class="rv-link"><a href="${esc(link)}" target="_blank" rel="noopener">${ico('link')} Abrir el archivo entregado</a></p>` : (enRev ? '<p class="rv-aviso">El aprendiz no dejó link del archivo.</p>' : '')}
    <div class="field"><label for="rv-obs">Observación ${enRev?'(opcional si apruebas, obligatoria si devuelves)':'(opcional)'}</label><textarea id="rv-obs" maxlength="800" placeholder="Qué te pareció, qué corregir…"></textarea></div>
    <div class="form-error" id="rv-error" role="alert"></div>
    <div class="modal-actions"><button type="button" class="btn secondary" id="rv-cancel">Cancelar</button>${enRev?'<button type="button" class="btn danger" id="rv-devolver">Devolver con comentario</button>':''}<button type="button" class="btn ok" id="rv-aprobar">${ico('check')} Aprobar y completar</button></div>
  </div></div>`);
  document.body.appendChild(ov);
  const err = $('#rv-error', ov), obsEl = $('#rv-obs', ov);
  const ocupado = v=> ov.querySelectorAll('button').forEach(b=> b.disabled = v);
  $('#rv-cancel', ov).onclick = ()=> ov.remove();
  ov.addEventListener('mousedown', e=>{ if(e.target===ov) ov.remove(); });
  ov.addEventListener('keydown', e=>{ if(e.key==='Escape') ov.remove(); });
  const terminar = async (msg)=>{ ov.remove(); await loadAll(); renderAdminTab(); toast(msg); };
  $('#rv-aprobar', ov).onclick = async ()=>{
    const obs = obsEl.value.trim(); ocupado(true);
    const u = await supa.from('tareas').update({estado:'completada', updated_at:new Date().toISOString()}).eq('id', t.id);
    if(u && u.error){ err.textContent = 'No se pudo aprobar: ' + u.error.message; ocupado(false); return; }
    await supa.from('avances').insert({tarea_id:t.id, descripcion:`Estado cambiado: ${LABELS_ESTADO[t.estado]||t.estado} → Completada`, autor:`${NOMBRE_ADMIN} (aprobó)`});
    if(obs) await supa.from('avances').insert({tarea_id:t.id, descripcion:`Observación de la revisión: ${obs}`, autor:NOMBRE_ADMIN});
    await terminar('Tarea aprobada (' + momentoCO(new Date().toISOString()) + ')');
  };
  const dv = $('#rv-devolver', ov);
  if(dv) dv.onclick = async ()=>{
    const obs = obsEl.value.trim();
    if(!obs){ err.textContent = 'Escribe qué hay que corregir: el aprendiz lo verá.'; obsEl.focus(); return; }
    ocupado(true);
    const u = await supa.from('tareas').update({estado:'en_progreso', updated_at:new Date().toISOString()}).eq('id', t.id);
    if(u && u.error){ err.textContent = 'No se pudo devolver: ' + u.error.message; ocupado(false); return; }
    await supa.from('avances').insert({tarea_id:t.id, descripcion:`Devuelto para corrección: ${obs}`, autor:NOMBRE_ADMIN});
    await terminar('Tarea devuelta con tu comentario');
  };
  setTimeout(()=> obsEl.focus(), 60);
}
function avisoRevision(){
  const n = STATE.tareas.filter(t=>t.estado==='en_revision').length;
  if(!n) return '';
  return `<button type="button" class="aviso-rev" data-accion="ir-revision">${ico('revision')}<span><b>${n} entrega${n===1?'':'s'} por revisar</b> Tus aprendices las enviaron: apruébalas o devuélvelas.</span><span class="go">Revisar →</span></button>`;
}
function renderAdminRevision(){
  const v = $('#view-revision'); if(!v) return;
  const lista = STATE.tareas.filter(t=>t.estado==='en_revision').map(t=>{
    const ev = eventosDe(t);
    return {t, envio:ultimoEvento(ev, e=>e.k==='estado' && e.a==='en_revision'), entrega:ultimoEvento(ev, e=>e.k==='entrega')};
  }).sort((a,b)=> new Date(a.envio?a.envio.iso:a.t.updated_at) - new Date(b.envio?b.envio.iso:b.t.updated_at));
  const recientes = STATE.tareas.filter(t=>t.estado==='completada').map(t=>({t, ap:ultimoEvento(eventosDe(t), e=>e.k==='estado' && e.a==='completada')}))
    .filter(x=>x.ap).sort((a,b)=> new Date(b.ap.iso)-new Date(a.ap.iso)).slice(0,8);
  const card = ({t,envio,entrega})=>{
    const punt = envio ? textoPuntualidad(t, envio.iso) : '';
    const link = t.link_archivo && urlSegura(t.link_archivo) ? urlSegura(t.link_archivo) : '';
    return `<article class="rev-card">
      <div class="rev-main">
        <h4>${esc(t.titulo)}</h4>
        <div class="task-sub">${esc(talentoNombre(t.talento_id))} · ${esc(proyectoNombre(t.proyecto_id))}${t.fecha_entrega?' · Entrega '+esc(fmtCorta(t.fecha_entrega)):''}</div>
        <div class="rev-meta">${ico('clock')} ${envio?`Enviada <b>${esc(momentoCO(envio.iso))}</b> <span>(${esc(haceCO(envio.iso))})</span>`:(t.updated_at?`En revisión desde <b>${esc(momentoCO(t.updated_at))}</b>`:'Enviada a revisión')}${punt?` · <span class="${punt==='a tiempo'?'rv-ok':'rv-late'}">${esc(punt)}</span>`:''}</div>
        ${entrega && entrega.txt ? `<div class="rev-nota">${esc(entrega.txt)}</div>` : ''}
      </div>
      <div class="rev-actions">${link?`<a class="btn secondary small" href="${esc(link)}" target="_blank" rel="noopener">${ico('link')} Abrir archivo</a>`:''}<button type="button" class="btn small" data-revisar="${t.id}">Revisar</button></div>
    </article>`;
  };
  v.innerHTML = `<div class="section-title">Por revisar <span class="page-sub">${lista.length} entrega${lista.length===1?'':'s'}</span></div>`
    + (lista.length ? lista.map(card).join('') : `<div class="empty-state rev-vacio">${ico('revision')}<p><b>Nada por revisar.</b><br>Cuando un aprendiz envíe una tarea a revisión, aparece aquí con la fecha y hora del envío.</p></div>`)
    + (recientes.length ? `<div class="section-title" style="margin-top:34px;">Aprobadas recientemente</div><div class="rev-recientes">${recientes.map(({t,ap})=>`<button type="button" class="list-row rev-reciente" data-abrir="${t.id}"><span class="flex-grow"><b>${esc(t.titulo)}</b><span class="task-sub">${esc(talentoNombre(t.talento_id))}</span></span><span class="rev-hora">${esc(momentoCO(ap.iso))}</span></button>`).join('')}</div>` : '');
  v.querySelectorAll('[data-revisar]').forEach(b=> b.onclick = ()=> abrirAprobacion(b.dataset.revisar));
  v.querySelectorAll('[data-abrir]').forEach(b=> b.onclick = ()=> openTareaModal(b.dataset.abrir));
}
function selloKanban(t){
  if(t.estado==='pendiente') return '';
  const e = ultimoEvento(eventosDe(t), x=>x.k==='estado' && x.a===t.estado);
  if(!e) return '';
  const verbo = t.estado==='completada' ? 'Aprobada' : (t.estado==='en_revision' ? 'Enviada' : 'Desde');
  return `<div class="kstamp" title="${esc(momentoCO(e.iso))}">${ico('clock')}<span>${verbo} ${esc(momentoCO(e.iso))}</span></div>`;
}
function renderAvancesModal(overlay, tareaId){
  const cont = $('#avances-list', overlay);
  if(!cont) return;
  const t = STATE.tareas.find(x=>x.id===tareaId);
  cont.innerHTML = t ? lineaTiempoHTML(t) : '';
}

/* ---------- administrador: clave de cada aprendiz ---------- */
function pillClave(t){
  if(!STATE.clavesOk) return '';
  return tieneClave(t.id) ? '<span class="pill ok">Clave creada</span>' : '<span class="pill warn">Sin clave</span>';
}
function baseLinkAprendiz(){ return location.origin + location.pathname.replace(/equipo-creativo-admin\.html$/,'equipo-creativo.html'); }
function claveAleatoria(){
  for(let i=0;i<20;i++){
    const a = new Uint32Array(1); (window.crypto||window.msCrypto).getRandomValues(a);
    const p = String(a[0]%10000).padStart(4,'0');
    if(!/^(\d)\1{3}$/.test(p) && !'0123456789'.includes(p) && !'9876543210'.includes(p)) return p;
  }
  return '4827';
}
function abrirModalClave(id){
  const t = STATE.talentos.find(x=>x.id===id); if(!t) return;
  const tiene = tieneClave(id);
  const pri = (t.nombre||'').split(' ')[0];
  const ov = el(`<div class="modal-overlay cl"><div class="modal" role="dialog" aria-modal="true" aria-label="Clave de ${esc(t.nombre)}">
    <h3>Clave de ${esc(t.nombre)}</h3>
    <p class="hint" style="margin:-6px 0 14px;">Con su clave de 4 dígitos ${esc(pri)} puede empezar sus tareas y enviarlas a revisión. Aprobarlas lo haces solo tú.</p>
    <p style="margin-bottom:14px;">${tiene?'<span class="pill ok">Ya tiene clave</span> <span class="hint">Si guardas otra, la anterior deja de servir.</span>':'<span class="pill warn">Todavía no tiene clave</span>'}</p>
    <div class="field"><label for="cl-pin">Clave nueva (4 números)</label>
      <div class="pin-row"><input id="cl-pin" class="pin-input" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" spellcheck="false" placeholder="••••"><button type="button" class="btn secondary small" id="cl-azar">Generar una</button></div>
    </div>
    <div class="form-error" id="cl-error" role="alert"></div>
    <div class="modal-actions">${tiene?'<button type="button" class="btn danger cerrar-izq" id="cl-quitar">Quitar clave</button>':''}<button type="button" class="btn secondary" id="cl-cancel">Cancelar</button><button type="button" class="btn" id="cl-guardar">Guardar clave</button></div>
  </div></div>`);
  document.body.appendChild(ov);
  const pinEl = $('#cl-pin', ov), err = $('#cl-error', ov);
  soloDigitos(pinEl);
  pinEl.addEventListener('input', ()=>{ err.textContent = ''; });
  $('#cl-cancel', ov).onclick = ()=> ov.remove();
  $('#cl-azar', ov).onclick = ()=>{ pinEl.value = claveAleatoria(); err.textContent=''; };
  const llamar = async (pin)=>{
    if(!STATE._adminHash){ return {ok:false, error:'sesion'}; }
    try{
      const r = await supa.rpc('admin_fijar_clave', {p_admin_hash:STATE._adminHash, p_talento:id, p_pin:pin});
      if(r.error){ const falta = /PGRST202|42883|could not find the function|does not exist/i.test((r.error.code||'')+' '+(r.error.message||'')); return {ok:false, error: falta?'falta':'red'}; }
      return r.data || {ok:false, error:'red'};
    }catch(e){ return {ok:false, error:'red'}; }
  };
  const textoErr = r=> ({falta:'Falta correr la migración v8 en Supabase (archivo supabase-migracion-v8-claves.sql).', admin:'No pude confirmar tu contraseña de administrador. Sal y vuelve a entrar.', sesion:'Vuelve a entrar con tu contraseña de administrador y repite.', formato:'La clave debe tener exactamente 4 números.', talento:'No encontré a esta persona.'}[r.error] || 'No se pudo guardar. Revisa tu conexión.');
  $('#cl-guardar', ov).onclick = async ()=>{
    const pin = pinEl.value;
    if(!/^\d{4}$/.test(pin)){ err.textContent = 'Escribe 4 números (o toca «Generar una»).'; pinEl.focus(); return; }
    const r = await llamar(pin);
    if(!r.ok){ err.textContent = textoErr(r); return; }
    ov.remove(); await loadAll(); renderAdminTab(); mostrarClaveCreada(t, pin);
  };
  const q = $('#cl-quitar', ov);
  if(q) q.onclick = async ()=>{
    if(q.dataset.seguro!=='1'){ q.dataset.seguro='1'; q.textContent='¿Seguro? Toca otra vez'; return; }
    const r = await llamar('');
    if(!r.ok){ err.textContent = textoErr(r); return; }
    ov.remove(); await loadAll(); renderAdminTab(); toast('Clave quitada: ' + esc(t.nombre) + ' ya no puede mover tareas');
  };
  setTimeout(()=> pinEl.focus(), 60);
}
function mostrarClaveCreada(t, pin){
  const link = `${baseLinkAprendiz()}?aprendiz=${t.id}`;
  const pri = (t.nombre||'').split(' ')[0];
  const msg = `Hola ${pri}, este es tu acceso al panel de tareas del equipo creativo:\n${link}\nTu clave: ${pin}\nCon ella marcas «Empezar» y «Enviar a revisión» en tus tareas. Cuando la envías, yo la reviso y la apruebo.`;
  const ov = el(`<div class="modal-overlay"><div class="modal" role="dialog" aria-modal="true" aria-label="Clave lista">
    <h3>Clave lista para ${esc(pri)}</h3>
    <div class="pin-grande" aria-label="Clave">${pin.split('').map(d=>`<span>${d}</span>`).join('')}</div>
    <p class="hint" style="text-align:center;margin-bottom:14px;">Anótala o mándasela ahora. Por seguridad se guarda cifrada y no se vuelve a mostrar.</p>
    <div class="field"><label for="cl-msg">Mensaje listo para enviar</label><textarea id="cl-msg" rows="6" readonly></textarea></div>
    <div class="modal-actions"><button type="button" class="btn secondary" id="cl-cerrar">Cerrar</button><button type="button" class="btn" id="cl-copiar">Copiar mensaje</button></div>
  </div></div>`);
  document.body.appendChild(ov);
  $('#cl-msg', ov).value = msg;
  $('#cl-cerrar', ov).onclick = ()=> ov.remove();
  $('#cl-copiar', ov).onclick = ()=>{
    const ok = ()=> toast('Mensaje copiado');
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(msg).then(ok, ()=>{ $('#cl-msg', ov).select(); toast('Selecciónalo y copia'); });
    else { $('#cl-msg', ov).select(); toast('Selecciónalo y copia'); }
  };
}

// Cuando ya quedó instalada, desaparecen el botón y el aviso de instalar
/* Escape cierra la ventana abierta aunque el foco no esté dentro de ella (no aplica a la que muestra la clave recién creada) */
document.addEventListener('keydown', e=>{
  if(e.key!=='Escape' || e.defaultPrevented) return;
  const m = [...document.querySelectorAll('.modal-overlay.mv,.modal-overlay.rv,.modal-overlay.cl,.modal-overlay.pd,#pwa-ayuda')].pop();
  if(m){ e.preventDefault(); m.remove(); }
});
window.addEventListener('appinstalled', ()=>{ document.querySelectorAll('#apr-instalar,#pwa-bar').forEach(e=>e.remove()); });

/* ============================================================
   MIS PENDIENTES · solo para el administrador
   Viven en una zona privada de Supabase (migración v9): se leen y se guardan con la
   contraseña del administrador, que solo está en memoria. No forman parte de las tareas
   del equipo, ni del link del jefe, ni del respaldo.
   ============================================================ */
Object.assign(ICONS,{
  pendientes:'<rect x="3.2" y="7" width="9.6" height="6.6" rx="1.8"/><path d="M5.4 7V5.4a2.6 2.6 0 015.2 0V7"/><path d="M6.3 10.3l1.2 1.2 2.3-2.4"/>',
  editar:'<path d="M3 13h2.3l7-7-2.3-2.3-7 7z"/><path d="M9 4.8l2.3 2.3"/>',
  papelera:'<path d="M3.5 4.6h9M6.4 4.6V3.2h3.2v1.4M4.8 4.6l.5 8.4h5.4l.5-8.4"/>'
});
const PRIO_ETQ = {alta:'Alta', media:'Media', baja:'Baja'};
const PRIO_ORD = {alta:0, media:1, baja:2};

function hoyCO(){ return diaCO(new Date().toISOString()); }
function diasEntreFechas(a, b){            // 'AAAA-MM-DD' → días de a a b
  const [ya,ma,da] = a.split('-').map(Number), [yb,mb,db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb,mb-1,db) - Date.UTC(ya,ma-1,da)) / 864e5);
}
function fechaLargaCO(f){
  const [y,m,d] = f.split('-').map(Number);
  const op = {weekday:'short', day:'numeric', month:'short', timeZone:'UTC'};
  if(String(y) !== hoyCO().slice(0,4)) op.year = 'numeric';
  return _sinEspaciosRaros(new Date(Date.UTC(y,m-1,d,12)).toLocaleDateString('es-CO', op)).replace(/[.,]/g,'').replace(/\s+/g,' ').trim();
}
function normPend(x){
  return {id:String(x.id), titulo:String(x.titulo||''), nota:String(x.nota||''), fecha:x.fecha||null,
          prioridad:PRIO_ETQ[x.prioridad]?x.prioridad:'media', hecha:!!x.hecha, hecha_en:x.hecha_en||null, creada:x.creada||''};
}
function pendUrg(){                          // por hacer con fecha de hoy o anterior
  if(!Array.isArray(STATE.pendientes)) return 0;
  const h = hoyCO();
  return STATE.pendientes.filter(p=> !p.hecha && p.fecha && p.fecha <= h).length;
}
function pendActualizarBadges(){
  const pu = pendUrg(), porRev = Array.isArray(STATE.tareas) ? STATE.tareas.filter(t=>t.estado==='en_revision').length : 0;
  setBadge('badge-pendientes', pu); setBadge('dbadge-mas', porRev + pu);
  const hs = document.querySelector('#view-dashboard .hello-sub'); if(hs) hs.textContent = resumenDia();
}
function ordenarPend(a, b){
  const fa = a.fecha || '9999-12-31', fb = b.fecha || '9999-12-31';
  if(fa !== fb) return fa < fb ? -1 : 1;
  if(PRIO_ORD[a.prioridad] !== PRIO_ORD[b.prioridad]) return PRIO_ORD[a.prioridad] - PRIO_ORD[b.prioridad];
  return String(a.creada) < String(b.creada) ? -1 : 1;
}
function etiquetaFechaPend(p){
  if(p.hecha) return p.hecha_en ? {txt:'Hecha · ' + momentoCO(p.hecha_en), cls:'ok'} : {txt:'Hecha', cls:'ok'};
  if(!p.fecha) return null;
  const d = diasEntreFechas(hoyCO(), p.fecha);
  if(d < 0)   return {txt: d===-1 ? 'Atrasado · ayer' : `Atrasado · hace ${-d} d`, cls:'danger'};
  if(d === 0) return {txt:'Vence hoy', cls:'warn'};
  if(d === 1) return {txt:'Mañana', cls:'warn'};
  return {txt:fechaLargaCO(p.fecha), cls:'dim'};
}

/* ---------- conexión con la zona privada ---------- */
async function pendRPC(fn, args){
  if(!STATE._adminPass) return {ok:false, error:'admin'};
  try{
    const r = await supa.rpc(fn, Object.assign({p_pass: STATE._adminPass}, args || {}));
    if(r.error){
      const m = String(r.error.message||'') + ' ' + String(r.error.code||'');
      return /PGRST202|42883|could not find the function|schema cache/i.test(m) ? {ok:false, error:'migracion'} : {ok:false, error:'red'};
    }
    return r.data || {ok:false, error:'red'};
  }catch(e){ return {ok:false, error:'red'}; }
}
async function cargarPendientes(){
  if(STATE.mode !== 'admin' || !STATE._enPanel) return;   // v10: la sesión de Supabase es la que da acceso
  STATE._pendCargadoEn = Date.now();
  const r = await pendRPC('jefe_pendientes_listar');
  if(r.ok){ STATE.pendientes = (r.items || []).map(normPend); STATE._pendEstado = 'ok'; }
  else { STATE._pendEstado = r.error || 'red'; STATE._pendMin = r.minutos; }
  pendActualizarBadges();
  if(STATE.activeTab === 'pendientes') pintarPendientes();
}
async function guardarPend(base, cambios){
  const d = Object.assign({}, base, cambios);
  return pendRPC('jefe_pendientes_guardar', {p_id: d.id || null, p_titulo: d.titulo, p_nota: d.nota || '', p_fecha: d.fecha || '', p_prioridad: d.prioridad || 'media', p_hecha: !!d.hecha});
}
function textoErrorPend(r){
  switch(r && r.error){
    case 'titulo':    return 'Escribe qué tienes pendiente (máximo 200 letras).';
    case 'nota':      return 'La nota es muy larga (máximo 1000 letras).';
    case 'fecha':     return 'La fecha no es válida.';
    case 'prioridad': return 'La prioridad no es válida.';
    case 'no_existe': return 'Ese pendiente ya no existe. Actualizo la lista.';
    case 'bloqueado': return `Demasiados intentos con contraseña incorrecta. Espera ${r.minutos||15} min.`;
    case 'admin':     return 'No pude confirmar tu contraseña. Sal del panel y vuelve a entrar.';
    case 'migracion': return 'Falta correr el archivo v9 en Supabase (supabase-migracion-v9-pendientes.sql).';
    default:          return 'No pude conectar. Revisa tu internet e intenta de nuevo.';
  }
}

/* ---------- pantalla ---------- */
function renderAdminPendientes(){
  const v = $('#view-pendientes'); if(!v) return;
  const b = STATE._pendBorrador || (STATE._pendBorrador = {titulo:'', fecha:'', prio:'media'});
  v.innerHTML = `
    <div class="section-title hello"><span class="hello-kicker pend-kicker">${ico('pendientes')} Solo tú los ves</span><h1>Mis pendientes</h1><p class="hello-sub" id="pend-sub"></p></div>
    <form class="pend-add" id="pend-form" autocomplete="off">
      <input id="pend-titulo" type="text" maxlength="200" placeholder="¿Qué tienes pendiente? Escríbelo y presiona Enter" aria-label="Nuevo pendiente" value="${esc(b.titulo)}">
      <input id="pend-fecha" type="date" aria-label="Fecha límite (opcional)" value="${esc(b.fecha)}">
      <select id="pend-prio" aria-label="Prioridad"><option value="alta">Prioridad alta</option><option value="media">Prioridad media</option><option value="baja">Prioridad baja</option></select>
      <button class="btn" id="pend-add-btn" type="submit">${ico('plus')} Agregar</button>
    </form>
    <div class="form-error" id="pend-error" role="alert"></div>
    <div id="pend-zona"></div>
    <p class="pend-priv">${ico('pendientes')} Privado de verdad: se guarda en una zona protegida de Supabase. No aparece para el equipo, ni en el link del jefe, ni en el respaldo.</p>`;
  $('#pend-prio').value = b.prio;
  $('#pend-titulo').addEventListener('input', e=>{ b.titulo = e.target.value; $('#pend-error').textContent = ''; });
  $('#pend-fecha').addEventListener('input', e=>{ b.fecha = e.target.value; });
  $('#pend-prio').addEventListener('input', e=>{ b.prio = e.target.value; });
  $('#pend-form').addEventListener('submit', e=>{ e.preventDefault(); agregarPendiente(); });
  $('#pend-zona').addEventListener('click', e=>{
    const a = e.target.closest('[data-acc]'); if(!a) return;
    const fila = a.closest('[data-id]'), id = fila && fila.dataset.id;
    if(a.dataset.acc === 'vista'){ STATE._pendVista = a.dataset.v; pintarPendientes(); }
    else if(a.dataset.acc === 'toggle') alternarPend(id);
    else if(a.dataset.acc === 'editar') abrirModalPendiente(id);
    else if(a.dataset.acc === 'borrar') confirmarBorrarPend(id);
  });
  pintarPendientes();
  if(Date.now() - (STATE._pendCargadoEn||0) > 20000) cargarPendientes();   // al volver a abrir la sección, se refresca (por si lo agregaste desde otro aparato)
}
function avisoPend(est){
  if(est === 'migracion') return `<div class="pend-aviso"><b>Falta activar esta sección en Supabase</b>
    <ol><li>Entra a Supabase → tu proyecto → <b>SQL Editor</b> → <b>New query</b>.</li><li>Abre el archivo <code>supabase-migracion-v9-pendientes.sql</code>, copia todo, pégalo y toca <b>Run</b>.</li><li>Vuelve aquí y toca el botón.</li></ol>
    <button type="button" class="btn small" id="pend-reintentar" data-acc="reintentar">Ya lo corrí, reintentar</button></div>`;
  if(est === 'bloqueado') return `<div class="pend-aviso"><b>Sección bloqueada por seguridad</b><p>Hubo varios intentos con una contraseña incorrecta. Vuelve a intentar en ${STATE._pendMin||15} min.</p><button type="button" class="btn small" id="pend-reintentar">Reintentar</button></div>`;
  if(est === 'admin') return `<div class="pend-aviso"><b>No pude confirmar tu contraseña</b><p>Sal del panel y vuelve a entrar con tu contraseña de administrador.</p></div>`;
  if(est === 'red') return `<div class="pend-aviso"><b>No pude conectar con Supabase</b><p>Revisa tu internet.</p><button type="button" class="btn small" id="pend-reintentar">Reintentar</button></div>`;
  return `<div class="pend-vacio"><p>Cargando tus pendientes…</p></div>`;
}
function filaPend(p){
  const et = etiquetaFechaPend(p);
  return `<li class="pend-item${p.hecha?' hecha':''}" data-id="${esc(p.id)}">
    <button type="button" class="pend-check" data-acc="toggle" aria-pressed="${p.hecha}" aria-label="${p.hecha?'Volver a pendiente':'Marcar como hecho'}: ${esc(p.titulo)}"><span class="pend-check-i">${ico('check')}</span></button>
    <div class="pend-main" data-acc="editar">
      <div class="pend-titulo">${esc(p.titulo)}</div>
      ${p.nota ? `<div class="pend-nota">${esc(p.nota)}</div>` : ''}
      <div class="pend-meta">${et ? `<span class="pill ${et.cls}">${esc(et.txt)}</span>` : ''}${p.hecha ? '' : `<span class="pend-prio ${p.prioridad}"><i></i>${PRIO_ETQ[p.prioridad]}</span>`}</div>
    </div>
    <div class="pend-acts"><button type="button" class="pend-ib" data-acc="editar" aria-label="Editar: ${esc(p.titulo)}">${ico('editar')}</button><button type="button" class="pend-ib" data-acc="borrar" aria-label="Eliminar: ${esc(p.titulo)}">${ico('papelera')}</button></div>
  </li>`;
}
function pintarPendientes(){
  const z = $('#pend-zona'); if(!z) return;
  const est = STATE._pendEstado || 'cargando', lista = Array.isArray(STATE.pendientes) ? STATE.pendientes : null;
  const form = $('#pend-form'), sub = $('#pend-sub');
  const apagado = !(est === 'ok' && lista);
  if(form) form.querySelectorAll('input,select,button').forEach(x=> x.disabled = apagado);
  if(apagado){
    if(sub) sub.textContent = '';
    z.innerHTML = avisoPend(est);
    const r = $('#pend-reintentar', z);
    if(r) r.onclick = ()=>{ STATE._pendEstado = 'cargando'; pintarPendientes(); cargarPendientes(); };
    return;
  }
  const porHacer = lista.filter(p=>!p.hecha).sort(ordenarPend);
  const hechas = lista.filter(p=>p.hecha).sort((a,b)=> String(b.hecha_en||'') < String(a.hecha_en||'') ? -1 : 1);
  const vista = STATE._pendVista === 'hechas' ? 'hechas' : 'porhacer', urg = pendUrg();
  if(sub) sub.textContent = porHacer.length
    ? `${porHacer.length} por hacer${urg ? ` · ${urg} para hoy o atrasado${urg===1?'':'s'}` : ''}.`
    : 'No tienes nada pendiente. Agrega lo que tengas en mente.';
  const items = vista === 'hechas' ? hechas : porHacer;
  z.innerHTML = `
    <div class="pend-tabs" role="tablist">
      <button type="button" role="tab" aria-selected="${vista==='porhacer'}" class="${vista==='porhacer'?'on':''}" data-acc="vista" data-v="porhacer">Por hacer <span>${porHacer.length}</span></button>
      <button type="button" role="tab" aria-selected="${vista==='hechas'}" class="${vista==='hechas'?'on':''}" data-acc="vista" data-v="hechas">Hechas <span>${hechas.length}</span></button>
    </div>
    ${items.length ? `<ul class="pend-lista">${items.map(filaPend).join('')}</ul>`
      : `<div class="pend-vacio">${ico('check')}<p>${vista==='hechas' ? 'Aún no has marcado ninguno como hecho.' : 'Todo hecho. Lo que agregues arriba aparece aquí.'}</p></div>`}`;
}

/* ---------- acciones ---------- */
async function agregarPendiente(){
  const ti = $('#pend-titulo'), err = $('#pend-error'), btn = $('#pend-add-btn'), tit = ti.value.trim();
  err.textContent = '';
  if(!tit){ err.textContent = 'Escribe qué tienes pendiente.'; ti.focus(); return; }
  btn.disabled = true;
  const r = await guardarPend({}, {titulo:tit, nota:'', fecha:$('#pend-fecha').value, prioridad:$('#pend-prio').value, hecha:false});
  btn.disabled = false;
  if(!r.ok){ err.textContent = textoErrorPend(r); return; }
  (STATE.pendientes = STATE.pendientes || []).push(normPend(r.item));
  STATE._pendBorrador = {titulo:'', fecha:'', prio:'media'};
  ti.value = ''; $('#pend-fecha').value = ''; $('#pend-prio').value = 'media';
  STATE._pendVista = 'porhacer';
  pendActualizarBadges(); pintarPendientes(); ti.focus();
}
async function alternarPend(id){
  const p = (STATE.pendientes || []).find(x=>x.id===id); if(!p) return;
  const antes = Object.assign({}, p);
  p.hecha = !p.hecha; p.hecha_en = p.hecha ? new Date().toISOString() : null;
  pendActualizarBadges(); pintarPendientes();
  const r = await guardarPend(antes, {hecha:p.hecha});
  if(r.ok) Object.assign(p, normPend(r.item));
  else { Object.assign(p, antes); toast(esc(textoErrorPend(r))); if(r.error==='no_existe') cargarPendientes(); }
  pendActualizarBadges(); pintarPendientes();
}
function abrirModalPendiente(id){
  const p = (STATE.pendientes || []).find(x=>x.id===id); if(!p) return;
  document.querySelectorAll('.modal-overlay.pd').forEach(x=>x.remove());
  const ov = el(`<div class="modal-overlay pd"><div class="modal" role="dialog" aria-modal="true" aria-label="Editar pendiente">
    <h3>Editar pendiente</h3>
    <div class="field"><label for="pd-titulo">Pendiente</label><input id="pd-titulo" type="text" maxlength="200" autocomplete="off" value="${esc(p.titulo)}"></div>
    <div class="field"><label for="pd-nota">Nota (opcional)</label><textarea id="pd-nota" maxlength="1000" placeholder="Detalles, a quién llamar, links…">${esc(p.nota)}</textarea></div>
    <div class="pd-fila">
      <div class="field"><label for="pd-fecha">Fecha límite</label><input id="pd-fecha" type="date" value="${esc(p.fecha||'')}"></div>
      <div class="field"><label for="pd-prio">Prioridad</label><select id="pd-prio"><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></select></div>
    </div>
    <label class="chk"><input type="checkbox" id="pd-hecha"${p.hecha?' checked':''}> Ya está hecho</label>
    <div class="form-error" id="pd-error" role="alert"></div>
    <div class="modal-actions"><button type="button" class="btn danger small" id="pd-del" style="margin-right:auto">${ico('papelera')} Eliminar</button><button type="button" class="btn secondary" id="pd-cancel">Cancelar</button><button type="button" class="btn" id="pd-ok">Guardar</button></div>
  </div></div>`);
  document.body.appendChild(ov);
  $('#pd-prio', ov).value = p.prioridad;
  const err = $('#pd-error', ov), ok = $('#pd-ok', ov);
  $('#pd-cancel', ov).onclick = ()=> ov.remove();
  ov.addEventListener('mousedown', e=>{ if(e.target===ov) ov.remove(); });
  $('#pd-del', ov).onclick = ()=>{ ov.remove(); confirmarBorrarPend(id); };
  ov.addEventListener('input', ()=>{ err.textContent = ''; });
  const guardar = async ()=>{
    const tit = $('#pd-titulo', ov).value.trim();
    if(!tit){ err.textContent = 'Escribe qué tienes pendiente.'; $('#pd-titulo', ov).focus(); return; }
    ok.disabled = true; const txt = ok.textContent; ok.textContent = 'Guardando…';
    const r = await guardarPend(p, {titulo:tit, nota:$('#pd-nota', ov).value.trim(), fecha:$('#pd-fecha', ov).value, prioridad:$('#pd-prio', ov).value, hecha:$('#pd-hecha', ov).checked});
    if(r.ok){ Object.assign(p, normPend(r.item)); ov.remove(); pendActualizarBadges(); pintarPendientes(); return; }
    err.textContent = textoErrorPend(r); ok.disabled = false; ok.textContent = txt;
    if(r.error === 'no_existe'){ ov.remove(); cargarPendientes(); }
  };
  ok.onclick = guardar;
  ov.addEventListener('keydown', e=>{ if(e.key==='Enter' && e.target.tagName!=='TEXTAREA' && e.target.tagName!=='BUTTON'){ e.preventDefault(); guardar(); } });
  setTimeout(()=>{ const f = $('#pd-titulo', ov); if(f){ f.focus(); f.select(); } }, 60);
}
function confirmarBorrarPend(id){
  const p = (STATE.pendientes || []).find(x=>x.id===id); if(!p) return;
  document.querySelectorAll('.modal-overlay.pd').forEach(x=>x.remove());
  const ov = el(`<div class="modal-overlay pd"><div class="modal" role="alertdialog" aria-modal="true" aria-label="Eliminar pendiente">
    <h3>¿Eliminar este pendiente?</h3><p class="mv-tarea">${esc(p.titulo)}</p>
    <p class="hint">No se puede deshacer.</p><div class="form-error" id="pd-error" role="alert"></div>
    <div class="modal-actions"><button type="button" class="btn secondary" id="pd-cancel">Cancelar</button><button type="button" class="btn danger" id="pd-ok">Eliminar</button></div></div></div>`);
  document.body.appendChild(ov);
  const ok = $('#pd-ok', ov);
  $('#pd-cancel', ov).onclick = ()=> ov.remove();
  ov.addEventListener('mousedown', e=>{ if(e.target===ov) ov.remove(); });
  ok.onclick = async ()=>{
    ok.disabled = true; ok.textContent = 'Eliminando…';
    const r = await pendRPC('jefe_pendientes_borrar', {p_id: id});
    if(r.ok || r.error === 'no_existe'){ STATE.pendientes = (STATE.pendientes || []).filter(x=>x.id!==id); ov.remove(); pendActualizarBadges(); pintarPendientes(); return; }
    $('#pd-error', ov).textContent = textoErrorPend(r); ok.disabled = false; ok.textContent = 'Eliminar';
  };
  setTimeout(()=> $('#pd-cancel', ov).focus(), 60);
}

/* ============================================================
   SEGURIDAD (v10)
   - Administrador: entra con su usuario de Supabase Auth (correo + contraseña).
     La base de datos solo le responde a esa sesión.
   - Aprendiz: ve SOLO sus tareas, y solo después de escribir su clave de 4 dígitos.
   - Dirección y formulario de solicitudes: link con código secreto que se puede revocar.
   - Nada de esto depende del navegador: el servidor es el que valida (migración v10).
   ============================================================ */
// Que nadie pueda meter la app dentro de otra página (clickjacking).
// GitHub Pages no deja poner la cabecera frame-ancestors, así que: si la app está dentro de un marco,
// intenta salirse y, si el navegador no lo permite, NO muestra la app (solo un aviso con un link a su propia pestaña).
const EN_MARCO = (() => { try { return window.top !== window.self; } catch (e) { return true; } })();
if (EN_MARCO) { document.documentElement.classList.add('en-marco'); try { window.top.location.replace(window.self.location.href); } catch (e) {} }
function renderEnMarco() {
  $('#app').innerHTML = `<div class="gate"><div class="gate-card" id="aviso-marco"><div class="crown-big">${logoHTML(44)}</div>
    <h2>Abre la app en su propia pestaña</h2><p>Por seguridad, esta app no funciona dentro de otra página.</p>
    <a class="btn" id="abrir-sola" href="${esc(location.href)}" target="_top" rel="noopener">Abrir la app</a></div></div>`;
}

// Botones sin código en línea (para que la política de seguridad bloquee cualquier script inyectado)
document.addEventListener('click', e => {
  const b = e.target.closest('[data-accion]'); if (!b) return;
  if (b.dataset.accion === 'tema') toggleTheme();
  else if (b.dataset.accion === 'ir-revision') irATab('revision');
});

// Colores de marca: solo se aceptan códigos #hex (así un valor raro no puede meter estilos ni salirse del atributo)
function colorSeguro(c) { c = String(c || '').trim(); return /^#[0-9a-f]{3,8}$/i.test(c) ? c : '#8a8a84'; }

/* ---------- llamadas al servidor ---------- */
async function rpcSeguro(fn, args) {
  try {
    const r = await supa.rpc(fn, args || {});
    if (r.error) {
      const m = String(r.error.message || '') + ' ' + String(r.error.code || '');
      if (/PGRST202|42883|could not find the function|schema cache/i.test(m)) return { ok: false, error: 'migracion' };
      if (/42501|permission denied|JWT|401/i.test(m)) return { ok: false, error: 'permiso' };
      return { ok: false, error: 'red' };
    }
    return r.data == null ? { ok: false, error: 'red' } : r.data;
  } catch (e) { return { ok: false, error: 'red' }; }
}
async function pendRPC(fn, args) { return rpcSeguro(fn, Object.assign({ p_pass: '' }, args || {})); }   // "Mis pendientes" usa la sesión
async function cargarClaves() {
  if (STATE.mode !== 'admin') { STATE.clavesOk = true; STATE.claves = STATE.talentoId ? [STATE.talentoId] : []; return; }
  try { const r = await supa.rpc('claves_estado'); STATE.clavesOk = !r.error; STATE.claves = (r && r.data) || []; }
  catch (e) { STATE.clavesOk = false; STATE.claves = []; }
}
const porFechaDesc = (a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''));

/* ---------- carga de datos según quién entra ---------- */
async function loadAll() {
  if (STATE.mode === 'aprendiz') return cargarAprendiz();
  if (STATE.mode === 'jefe') return cargarDireccion();
  if (STATE.mode !== 'admin') return;
  const [t, p, ta, m, av, so] = await Promise.all([
    supa.from('talentos').select('*').order('nombre'),
    supa.from('proyectos').select('*').order('created_at', { ascending: false }),
    supa.from('tareas').select('*').order('created_at', { ascending: false }),
    supa.from('metas').select('*').order('created_at', { ascending: false }),
    supa.from('avances').select('*').order('created_at', { ascending: false }),
    supa.from('solicitudes').select('*').order('created_at', { ascending: false }),
  ]);
  const err = [t, p, ta, m, av, so].find(x => x.error);
  if (err) { STATE._cargaError = String(err.error.message || err.error.code || 'error'); }
  STATE.talentos = t.data || []; STATE.proyectos = p.data || []; STATE.tareas = ta.data || [];
  STATE.metas = m.data || []; STATE.avances = av.data || []; STATE.solicitudes = so.data || [];
  await cargarClaves();
  if (Date.now() - (STATE._pendCargadoEn || 0) > 60000) cargarPendientes();   // sin esperar
}
async function cargarAprendiz() {
  const id = STATE.talentoId, pin = claveGuardada(id);
  if (!pin) { STATE._aprEstado = 'pin'; return { ok: false, error: 'pin' }; }
  const r = await rpcSeguro('aprendiz_datos', { p_talento: id, p_pin: pin });
  if (!r.ok) {
    STATE._aprEstado = r.error; STATE._aprInfo = r;
    if (['clave', 'sin_clave', 'acceso'].includes(r.error)) olvidarClave(id);
    return r;
  }
  STATE._aprEstado = 'ok';
  STATE.talentos = r.talento ? [r.talento] : []; STATE.tareas = (r.tareas || []).sort(porFechaDesc);
  STATE.avances = (r.avances || []).sort(porFechaDesc); STATE.proyectos = r.proyectos || [];
  STATE.metas = []; STATE.solicitudes = []; STATE.claves = [id]; STATE.clavesOk = true;
  return r;
}
async function cargarDireccion() {
  const r = await rpcSeguro('direccion_datos', { p_token: STATE.tokenDir || '' });
  if (!r.ok) { STATE._dirEstado = r.error; return r; }
  STATE._dirEstado = 'ok';
  STATE.talentos = (r.talentos || []).sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
  STATE.proyectos = (r.proyectos || []).sort(porFechaDesc); STATE.tareas = (r.tareas || []).sort(porFechaDesc);
  STATE.metas = (r.metas || []).sort(porFechaDesc); STATE.avances = (r.avances || []).sort(porFechaDesc); STATE.solicitudes = [];
  return r;
}
function subscribeRealtime(cb) {
  STATE._refrescar = cb;
  if (STATE.mode !== 'admin' || STATE._canal) return;        // solo la sesión del administrador escucha la base en vivo
  STATE._canal = supa.channel('cambios-equipo');
  ['talentos', 'proyectos', 'tareas', 'metas', 'avances', 'solicitudes'].forEach(tb =>
    STATE._canal.on('postgres_changes', { event: '*', schema: 'public', table: tb }, async () => { await loadAll(); if (STATE._refrescar) STATE._refrescar(); }));
  STATE._canal.subscribe();
}
// aprendiz y dirección: se actualizan solos cada pocos segundos (sin abrir la base al público)
function sondeo(ms, fn) {
  const tick = async () => { if (document.hidden || document.querySelector('.modal-overlay')) return; await fn(); };
  clearInterval(STATE._sondeo); STATE._sondeo = setInterval(tick, ms); STATE._tick = tick;
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
}
const firma = () => JSON.stringify([STATE.tareas, STATE.avances, STATE.talentos, STATE.proyectos]);

/* ---------- arranque ---------- */
async function boot() {
  if (EN_MARCO) return renderEnMarco();
  const params = new URLSearchParams(location.search);
  const archivoAdmin = !!window.__ARCHIVO_ADMIN && !params.has('aprendiz') && params.get('vista') !== 'jefe' && params.get('solicitar') !== '1';
  if (params.get('admin') === '1' || params.has('aprendiz') || params.get('vista') === 'jefe') { try { localStorage.setItem('equipo_ultima_ruta', location.search); } catch (e) {} }
  supa.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT' && STATE.mode === 'admin' && STATE._enPanel) { STATE._enPanel = false; renderAdminGate('Tu sesión terminó. Vuelve a entrar.'); } });
  if (params.get('admin') === '1' || archivoAdmin) { STATE.mode = 'admin'; return bootAdmin(); }
  if (params.has('aprendiz')) { STATE.mode = 'aprendiz'; STATE.talentoId = params.get('aprendiz'); return bootAprendiz(); }
  if (params.get('vista') === 'jefe') { STATE.mode = 'jefe'; STATE.tokenDir = params.get('k') || ''; return bootDireccion(); }
  if (params.get('solicitar') === '1') { STATE.mode = 'solicitar'; STATE.tokenSol = params.get('k') || ''; return bootSolicitar(); }
  let ruta = ''; try { ruta = localStorage.getItem('equipo_ultima_ruta') || ''; } catch (e) {}
  if (/^\?(admin=1|aprendiz=|vista=jefe)/.test(ruta)) { location.replace(location.pathname + ruta); return; }
  renderNoAccess();
}

/* ---------- administrador: Supabase Auth ---------- */
async function bootAdmin() {
  $('#app').innerHTML = `<div class="gate"><div class="gate-card"><div class="crown-big">${logoHTML(44)}</div><p>Cargando…</p></div></div>`;
  try {
    const { data } = await supa.auth.getSession();
    if (data && data.session) {
      const ok = await verificarAdmin();
      if (ok === true) return entrarAdmin();
      if (ok === false) await supa.auth.signOut();
      return renderAdminGate(ok === null ? 'Falta correr la migración v10 en Supabase.' : 'Esta cuenta no tiene permiso de administrador.');
    }
  } catch (e) {}
  renderAdminGate();
}
async function verificarAdmin() {
  const r = await supa.rpc('es_admin');
  if (r.error) return /PGRST202|could not find|schema cache/i.test(String(r.error.message) + r.error.code) ? null : false;
  return r.data === true;
}
async function entrarAdmin() {
  STATE._adminHash = 'sesion'; STATE._enPanel = true;
  await loadAll(); renderAdminApp();
  subscribeRealtime(() => { if (STATE.mode === 'admin') renderAdminTab(); });
}
async function salirAdmin() {
  try { await supa.auth.signOut(); } catch (e) {}
  STATE._enPanel = false; location.reload();
}
function renderAdminGate(msg) {
  let correo = ''; try { correo = localStorage.getItem('equipo_admin_correo') || ''; } catch (e) {}
  $('#app').innerHTML = `
    <div class="gate"><div class="gate-card">
      <div class="crown-big">${logoHTML(44)}</div>
      <h2>Acceso administrador</h2>
      <p>Entra con el correo y la contraseña de tu usuario de administrador.</p>
      <form id="admin-form" class="gate-form" novalidate>
        <input type="email" id="admin-email" name="email" placeholder="Correo" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" value="${esc(correo)}">
        <input type="password" id="admin-pass" name="password" placeholder="Contraseña" autocomplete="current-password" autocapitalize="off" autocorrect="off" spellcheck="false">
        <label class="gate-chk"><input type="checkbox" id="admin-show-pass"> Mostrar contraseña</label>
        <button class="btn" id="admin-login-btn" type="submit">Entrar</button>
        <div id="admin-error" class="form-error" role="alert">${msg ? esc(msg) : ''}</div>
      </form>
    </div></div>`;
  $('#admin-show-pass').onchange = e => { $('#admin-pass').type = e.target.checked ? 'text' : 'password'; };
  $('#admin-form').addEventListener('submit', e => { e.preventDefault(); tryAdminLogin(); });
  (correo ? $('#admin-pass') : $('#admin-email')).focus();
}
async function tryAdminLogin() {
  const email = $('#admin-email').value.trim(), pass = $('#admin-pass').value, err = $('#admin-error'), btn = $('#admin-login-btn');
  if (!email || !pass) { err.textContent = 'Escribe tu correo y tu contraseña.'; return; }
  btn.disabled = true; btn.textContent = 'Verificando…'; err.textContent = '';
  const fallo = m => { err.textContent = m; btn.disabled = false; btn.textContent = 'Entrar'; $('#admin-pass').select(); };
  try {
    const { error } = await supa.auth.signInWithPassword({ email, password: pass });
    if (error) {
      const m = String(error.message || '') + ' ' + String(error.code || '') + ' ' + String(error.status || '');
      if (/rate|too many|429/i.test(m)) return fallo('Demasiados intentos. Espera unos minutos y vuelve a intentar.');
      if (/confirm/i.test(m)) return fallo('Tu usuario no está confirmado. En Supabase marca "Auto Confirm User".');
      if (/invalid|credentials|400/i.test(m)) return fallo('Correo o contraseña incorrectos.');
      return fallo('No se pudo entrar. Revisa tu conexión.');
    }
    const ok = await verificarAdmin();
    if (ok !== true) { await supa.auth.signOut(); return fallo(ok === null ? 'Falta correr la migración v10 en Supabase.' : 'Esta cuenta no tiene permiso de administrador.'); }
    try { localStorage.setItem('equipo_admin_correo', email); } catch (e) {}
    await entrarAdmin();
  } catch (e) { fallo('No se pudo entrar. Revisa tu conexión.'); }
}

/* ---------- aprendiz: clave antes de ver nada ---------- */
async function bootAprendiz() {
  $('#app').innerHTML = `<div class="gate"><div class="gate-card"><div class="crown-big">${logoHTML(44)}</div><p>Cargando…</p></div></div>`;
  await cargarAprendiz();
  renderAprendizView();
  sondeo(20000, async () => {
    if (STATE._aprEstado !== 'ok') return;
    const antes = firma(); const r = await cargarAprendiz();
    if (!r.ok || firma() !== antes) renderAprendizView();
  });
}
function renderAprendizView() {
  if (STATE._aprEstado === 'ok') return renderAprendizVista();
  renderClaveGate();
}
function textoGateAprendiz() {
  const r = STATE._aprInfo || {};
  switch (STATE._aprEstado) {
    case 'clave': return r.restantes ? `Clave incorrecta. Te quedan ${r.restantes} intento${r.restantes === 1 ? '' : 's'}.` : 'Clave incorrecta.';
    case 'bloqueado': return `Demasiados intentos. Espera ${r.minutos || 15} min o pídele al jefe que restablezca tu clave.`;
    case 'sin_clave': return 'Este link no tiene clave todavía. Pídele al jefe que te la cree.';
    case 'acceso': return 'Tu acceso está desactivado. Habla con el jefe.';
    case 'migracion': return 'La app se está actualizando. Intenta de nuevo en unos minutos.';
    case 'red': return 'No pude conectar. Revisa tu internet e intenta de nuevo.';
    default: return '';
  }
}
function renderClaveGate() {
  $('#app').innerHTML = `
    <div class="gate"><div class="gate-card">
      <div class="crown-big">${logoHTML(44)}</div>
      <h2>Tus tareas</h2>
      <p>Escribe tu clave de 4 dígitos para entrar.</p>
      <form id="pin-form" class="gate-form" novalidate>
        <input id="gate-pin" class="pin-input gate-pin" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-label="Clave de 4 dígitos" placeholder="••••">
        <label class="gate-chk"><input type="checkbox" id="gate-rec"> Recordar en este dispositivo</label>
        <button class="btn" id="gate-ok" type="submit">Entrar</button>
        <div id="gate-error" class="form-error" role="alert">${esc(textoGateAprendiz())}</div>
      </form>
      <p class="hint">¿No tienes clave o la olvidaste? Pídesela al jefe.</p>
    </div></div>`;
  const inp = $('#gate-pin'); soloDigitos(inp);
  inp.addEventListener('input', () => { $('#gate-error').textContent = ''; });
  $('#pin-form').addEventListener('submit', async e => {
    e.preventDefault();
    const pin = inp.value;
    if (!/^\d{4}$/.test(pin)) { $('#gate-error').textContent = 'La clave tiene 4 números.'; inp.focus(); return; }
    const b = $('#gate-ok'); b.disabled = true; b.textContent = 'Entrando…';
    guardarClave(STATE.talentoId, pin, $('#gate-rec').checked);
    const r = await cargarAprendiz();
    if (!r.ok && r.error !== 'red') olvidarClave(STATE.talentoId);
    renderAprendizView();
  });
  if (STATE._aprEstado !== 'bloqueado' && STATE._aprEstado !== 'acceso') setTimeout(() => inp.focus(), 60);
}

/* ---------- dirección: link con código ---------- */
async function bootDireccion() {
  await cargarDireccion();
  renderJefeView();
  sondeo(60000, async () => {
    const antes = firma(); const r = await cargarDireccion();
    if (!r.ok || firma() !== antes) renderJefeView();
  });
}
function renderJefeView() {
  if (STATE._dirEstado === 'ok') return renderJefeVista();
  renderLinkInvalido(STATE._dirEstado === 'enlace' ? 'Este link de dirección no es válido o fue reemplazado. Pídele al jefe el link actualizado.' : 'No pude cargar la información. Revisa tu internet e intenta de nuevo.');
}
function renderLinkInvalido(msg) {
  $('#app').innerHTML = `<div class="gate"><div class="gate-card"><div class="crown-big">${logoHTML(44)}</div><h2>Equipo creativo</h2><p>${esc(msg)}</p></div></div>`;
}

/* ---------- formulario de solicitudes: link con código ---------- */
async function bootSolicitar() {
  const r = await rpcSeguro('solicitud_enlace', { p_token: STATE.tokenSol || '' });
  if (!r.ok) return renderLinkInvalido(r.error === 'enlace' ? 'Este link de solicitudes no es válido o fue reemplazado. Pide el link actualizado al equipo creativo.' : 'No pude abrir el formulario. Revisa tu internet e intenta de nuevo.');
  renderSolicitarView();
}
function nombreArchivoSeguro(n) {
  const limpio = String(n || 'archivo').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^[._]+/, '');
  return (limpio || 'archivo').slice(-80);
}
function azar() { const a = new Uint8Array(6); crypto.getRandomValues(a); return Array.from(a, x => x.toString(16).padStart(2, '0')).join(''); }
const ERR_SOLICITUD = {
  enlace: 'Este link ya no es válido. Pide el link actualizado al equipo creativo.',
  limite: 'Se enviaron muchas solicitudes en la última hora. Intenta de nuevo más tarde.',
  area: 'Escribe el área o la persona que solicita (máximo 80 letras).', asunto: 'Escribe el asunto (máximo 160 letras).',
  largo: 'Algún texto es demasiado largo. Acórtalo e intenta de nuevo.', prioridad: 'Elige una prioridad válida.',
  fecha: 'La fecha no es válida.', hora: 'La hora no es válida.', archivo: 'El archivo no se pudo adjuntar. Intenta de nuevo.',
  migracion: 'El formulario se está actualizando. Intenta en unos minutos.', red: 'No se pudo enviar. Revisa tu internet e intenta de nuevo.',
};
function renderSolicitarView() {
  $('#app').innerHTML = `
    <div class="topbar">
      <div class="brand">${logoHTML(30)}<div class="sub">Solicitar tarea al equipo creativo</div></div>
      <div class="topbar-actions">${themeToggleHTML()}</div>
    </div>
    <div class="solicitud-wrap">
      <h1 class="form-title">Solicitar un trabajo</h1>
      <p class="form-lead">Completa este formulario para pedir una pieza, diseño, video u otro material al equipo creativo. Tu solicitud será revisada y asignada.</p>
      <div id="solicitud-form">
        <div class="field-row">
        <div class="field"><label for="s-area">Área o persona que solicita *</label><input id="s-area" maxlength="80" placeholder="Ej. Mercadeo, Tienda Cali"></div>
        <div class="field"><label for="s-nombre">Tu nombre (opcional)</label><input id="s-nombre" maxlength="80"></div>
        </div>
        <div class="field"><label for="s-asunto">Asunto *</label><input id="s-asunto" maxlength="160" placeholder="¿Qué necesitas?"></div>
        <div class="field"><label for="s-desc">Descripción</label><textarea id="s-desc" maxlength="4000" placeholder="Cuéntanos con detalle qué necesitas, para qué es, contexto importante..."></textarea></div>
        <div class="field-row">
        <div class="field"><label for="s-tipo">Tipo</label><input id="s-tipo" maxlength="60" placeholder="Diseño, video, pauta..."></div>
        <div class="field"><label for="s-prioridad">Prioridad</label>
          <select id="s-prioridad">${PRIORIDADES.map(p => `<option value="${esc(p)}" ${p === 'media' ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
        </div>
        </div>
        <div class="field-row">
        <div class="field"><label for="s-fecha">Fecha en que lo necesitas</label><input type="date" id="s-fecha"></div>
        <div class="field"><label for="s-hora">Hora (opcional)</label><input type="time" id="s-hora"></div>
        </div>
        <div class="field"><label for="s-links">Links de referencia (opcional, uno por línea)</label><textarea id="s-links" maxlength="2000" placeholder="https://..."></textarea></div>
        <div class="field"><label for="s-archivo">O adjunta un archivo de referencia (opcional, máx. 50 MB)</label><input type="file" id="s-archivo"><div style="font-size:11px;color:var(--text-dim);margin-top:4px;">Para videos pesados, sube el archivo a Drive o WeTransfer y pega el link arriba.</div></div>
        <button class="btn" id="btn-enviar-solicitud" style="width:100%;">Enviar solicitud</button>
        <div id="s-error" class="form-error" role="alert" style="margin-top:8px;"></div>
      </div>
    </div>`;
  $('#btn-enviar-solicitud').onclick = enviarSolicitud;
}
async function enviarSolicitud() {
  const area = $('#s-area').value.trim(), asunto = $('#s-asunto').value.trim(), errEl = $('#s-error');
  if (!area || !asunto) { errEl.textContent = 'El área y el asunto son obligatorios.'; return; }
  const file = $('#s-archivo').files[0], MAX_MB = 50;
  if (file && file.size > MAX_MB * 1024 * 1024) { errEl.textContent = `El archivo pesa ${Math.round(file.size / 1048576)} MB y el máximo es ${MAX_MB} MB. Sube el archivo a Drive o WeTransfer y pega el link en "Links de referencia".`; return; }
  const btn = $('#btn-enviar-solicitud'); btn.disabled = true; btn.textContent = 'Enviando…'; errEl.textContent = '';
  const parar = m => { errEl.textContent = m; btn.disabled = false; btn.textContent = 'Enviar solicitud'; };
  let ticket = null, archivo_url = null, archivo_nombre = null;
  if (file) {
    const t = await rpcSeguro('solicitud_ticket', { p_token: STATE.tokenSol });
    if (!t.ok) return parar(ERR_SOLICITUD[t.error] || ERR_SOLICITUD.red);
    try {
      const path = `solicitudes/${t.ticket}/${Date.now()}_${azar()}_${nombreArchivoSeguro(file.name)}`;
      const { error: upErr } = await supa.storage.from(BUCKET_ARCHIVOS).upload(path, file);
      if (upErr) throw upErr;
      archivo_url = supa.storage.from(BUCKET_ARCHIVOS).getPublicUrl(path).data.publicUrl;
      archivo_nombre = String(file.name).slice(0, 200); ticket = t.ticket;
    } catch (e) {
      return parar('No se pudo subir el archivo, así que la solicitud NO se envió. Intenta de nuevo o pega un link en "Links de referencia".');
    }
  }
  const r = await rpcSeguro('solicitud_crear', { p_token: STATE.tokenSol, p_datos: {
    area_solicitante: area, nombre_solicitante: $('#s-nombre').value.trim(), asunto, descripcion: $('#s-desc').value.trim(),
    tipo: $('#s-tipo').value.trim(), fecha_necesaria: $('#s-fecha').value || null, hora_necesaria: $('#s-hora').value || null,
    prioridad: $('#s-prioridad').value, links_referencia: $('#s-links').value.trim(), ticket, archivo_url, archivo_nombre } });
  if (!r.ok) return parar(ERR_SOLICITUD[r.error] || ERR_SOLICITUD.red);
  $('.solicitud-wrap').innerHTML = `
    <div class="solicitud-success">
      <div class="check">${ico('check', '')}</div>
      <h2>Solicitud enviada</h2>
      <p style="color:var(--text-dim);font-size:13px;margin-top:8px;">El equipo creativo la revisará pronto.</p>
      <button class="btn secondary" style="margin-top:20px;" id="btn-otra">Enviar otra solicitud</button>
    </div>`;
  $('#btn-otra').onclick = renderSolicitarView;
}

/* ---------- panel: links para compartir (crear, copiar, revocar) ---------- */
const TIPO_ENLACE = { solicitud: 'Formulario de solicitudes', direccion: 'Vista de dirección' };
function urlEnlace(e) {
  const base = location.origin + location.pathname.replace(/equipo-creativo-admin\.html$/, 'equipo-creativo.html');
  return e.tipo === 'direccion' ? `${base}?vista=jefe&k=${e.token}` : `${base}?solicitar=1&k=${e.token}`;
}
async function pintarEnlaces() {
  const cont = $('#enlaces-seguros'); if (!cont) return;
  cont.innerHTML = '<div class="hint">Cargando links…</div>';
  const r = await rpcSeguro('enlaces_listar');
  if (!r.ok) { cont.innerHTML = `<div class="empty-state">${r.error === 'migracion' ? 'Falta correr la migración v10 en Supabase.' : 'No pude cargar los links. Intenta de nuevo.'}</div>`; return; }
  STATE._enlaces = r.items || [];
  const activos = STATE._enlaces.filter(e => e.activo), revocados = STATE._enlaces.filter(e => !e.activo);
  const fila = e => `
    <div class="list-row enlace-row" data-enlace="${esc(e.id)}">
      <div class="flex-grow">
        <div class="person-name">${esc(e.nombre)} <span class="pill dim">${esc(TIPO_ENLACE[e.tipo] || e.tipo)}</span></div>
        <div class="person-role">${e.usos ? `Usado ${e.usos} ${e.usos === 1 ? 'vez' : 'veces'} · último uso ${esc(momentoCO(e.ultimo_uso))}` : 'Aún sin usar'}</div>
        <code class="enlace-url">${esc(urlEnlace(e))}</code>
      </div>
      <div class="row-actions"><button class="btn small" data-copiar="${esc(e.id)}">Copiar</button><button class="btn danger small" data-revocar="${esc(e.id)}">Revocar</button></div>
    </div>`;
  cont.innerHTML = `
    <p class="hint enlace-hint">Cada link lleva un código secreto. Si alguien ya no debe tener acceso (por ejemplo, la agencia), revoca su link y deja de funcionar al instante.</p>
    ${activos.map(fila).join('') || '<div class="empty-state">No hay links activos.</div>'}
    <button class="btn secondary" id="btn-nuevo-enlace">${ico('plus')} Crear link</button>
    ${revocados.length ? `<details class="enlaces-revocados"><summary>Revocados (${revocados.length})</summary>${revocados.map(e => `<div class="list-row"><div class="flex-grow"><div class="person-name">${esc(e.nombre)}</div><div class="person-role">${esc(TIPO_ENLACE[e.tipo] || e.tipo)} · revocado ${esc(momentoCO(e.revocado))}</div></div></div>`).join('')}</details>` : ''}`;
  cont.querySelectorAll('[data-copiar]').forEach(b => b.onclick = () => { const e = STATE._enlaces.find(x => x.id === b.dataset.copiar); navigator.clipboard.writeText(urlEnlace(e)); toast('Link copiado'); });
  cont.querySelectorAll('[data-revocar]').forEach(b => b.onclick = () => confirmarRevocar(b.dataset.revocar));
  $('#btn-nuevo-enlace').onclick = abrirNuevoEnlace;
}
function confirmarRevocar(id) {
  const e = (STATE._enlaces || []).find(x => x.id === id); if (!e) return;
  const ov = el(`<div class="modal-overlay pd"><div class="modal" role="alertdialog" aria-modal="true" aria-label="Revocar link">
    <h3>¿Revocar este link?</h3><p class="mv-tarea">${esc(e.nombre)} · ${esc(TIPO_ENLACE[e.tipo] || e.tipo)}</p>
    <p class="hint">Quien lo tenga ya no podrá usarlo. No se puede deshacer, pero puedes crear uno nuevo cuando quieras.</p>
    <div class="form-error" id="rv-error" role="alert"></div>
    <div class="modal-actions"><button type="button" class="btn secondary" id="rv-cancel">Cancelar</button><button type="button" class="btn danger" id="rv-ok">Revocar</button></div></div></div>`);
  document.body.appendChild(ov);
  $('#rv-cancel', ov).onclick = () => ov.remove();
  ov.addEventListener('mousedown', ev => { if (ev.target === ov) ov.remove(); });
  $('#rv-ok', ov).onclick = async () => {
    const r = await rpcSeguro('enlace_revocar', { p_id: id });
    if (!r.ok) { $('#rv-error', ov).textContent = 'No se pudo revocar. Intenta de nuevo.'; return; }
    ov.remove(); toast('Link revocado'); pintarEnlaces();
  };
  setTimeout(() => $('#rv-cancel', ov).focus(), 60);
}
function abrirNuevoEnlace() {
  const ov = el(`<div class="modal-overlay pd"><div class="modal" role="dialog" aria-modal="true" aria-label="Crear link">
    <h3>Crear link para compartir</h3>
    <div class="field"><label for="ne-tipo">Para qué es</label><select id="ne-tipo"><option value="solicitud">Formulario de solicitudes</option><option value="direccion">Vista de dirección (solo lectura)</option></select></div>
    <div class="field"><label for="ne-nombre">Nombre (para que sepas quién lo tiene)</label><input id="ne-nombre" maxlength="60" placeholder="Ej. Agencia de redes"></div>
    <div class="form-error" id="ne-error" role="alert"></div>
    <div class="modal-actions"><button type="button" class="btn secondary" id="ne-cancel">Cancelar</button><button type="button" class="btn" id="ne-ok">Crear link</button></div></div></div>`);
  document.body.appendChild(ov);
  $('#ne-cancel', ov).onclick = () => ov.remove();
  ov.addEventListener('mousedown', ev => { if (ev.target === ov) ov.remove(); });
  const crear = async () => {
    const nombre = $('#ne-nombre', ov).value.trim();
    if (!nombre) { $('#ne-error', ov).textContent = 'Ponle un nombre (por ejemplo, a quién se lo vas a dar).'; return; }
    const r = await rpcSeguro('enlace_crear', { p_tipo: $('#ne-tipo', ov).value, p_nombre: nombre });
    if (!r.ok) { $('#ne-error', ov).textContent = r.error === 'limite' ? 'Tienes demasiados links activos. Revoca los que no uses.' : 'No se pudo crear. Intenta de nuevo.'; return; }
    ov.remove(); await pintarEnlaces();
    const e = (STATE._enlaces || []).find(x => x.id === r.id);
    if (e) { navigator.clipboard.writeText(urlEnlace(e)).catch(() => {}); toast('Link creado y copiado'); }
  };
  $('#ne-ok', ov).onclick = crear;
  $('#ne-nombre', ov).addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); crear(); } });
  setTimeout(() => $('#ne-nombre', ov).focus(), 60);
}

/* ============================================================
   CALENDARIO: vista SEMANA por practicante (nueva) + vista MES (la de siempre)
   ============================================================ */
const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIAS_LARGOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function calLunes(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; }
function calISO(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function calRango(a, b) {
  const y = a.getFullYear() !== b.getFullYear() ? ` de ${a.getFullYear()}` : '';
  return a.getMonth() === b.getMonth()
    ? `${a.getDate()} – ${b.getDate()} de ${MESES[b.getMonth()]} de ${b.getFullYear()}`
    : `${a.getDate()} de ${MESES[a.getMonth()]}${y} – ${b.getDate()} de ${MESES[b.getMonth()]} de ${b.getFullYear()}`;
}
function calVista() {
  if (!STATE.calVista) { try { STATE.calVista = localStorage.getItem('equipo_cal_vista') || 'semana'; } catch (e) { STATE.calVista = 'semana'; } }
  return STATE.calVista === 'mes' ? 'mes' : 'semana';
}
function calBarra() {
  const v = calVista();
  return `<div class="cal-bar">
    <div class="cal-switch" role="tablist" aria-label="Vista del calendario">
      <button type="button" role="tab" aria-selected="${v === 'semana'}" class="${v === 'semana' ? 'on' : ''}" data-cal-vista="semana">Semana</button>
      <button type="button" role="tab" aria-selected="${v === 'mes'}" class="${v === 'mes' ? 'on' : ''}" data-cal-vista="mes">Mes</button>
    </div>
    ${v === 'semana' ? `<label class="cal-sel"><span>Practicante</span><select id="cal-talento"><option value="">Todo el equipo</option>${STATE.talentos.map(t => `<option value="${esc(t.id)}" ${STATE.calTalento === t.id ? 'selected' : ''}>${esc(t.nombre)}</option>`).join('')}</select></label>` : ''}
  </div>`;
}
function calEnlazarBarra(view) {
  view.querySelectorAll('[data-cal-vista]').forEach(b => b.onclick = () => {
    STATE.calVista = b.dataset.calVista; try { localStorage.setItem('equipo_cal_vista', STATE.calVista); } catch (e) {}
    renderCalendario();
  });
  const s = view.querySelector('#cal-talento'); if (s) s.onchange = () => { STATE.calTalento = s.value || ''; renderCalendario(); };
}
function renderCalendario() {
  const view = $('#view-calendario'); if (!view) return;
  if (calVista() === 'mes') {
    renderCalendarioMes();
    view.insertAdjacentHTML('afterbegin', calBarra());
    calEnlazarBarra(view);
    return;
  }
  renderCalendarioSemana(view);
}
function calChip(t, conPersona) {
  const p = STATE.proyectos.find(x => x.id === t.proyecto_id), color = colorSeguro(p && p.color);
  const late = t.estado !== 'completada' && isAtrasada(t);
  const persona = conPersona ? (STATE.talentos.some(x => x.id === t.talento_id) ? talentoNombre(t.talento_id) : 'Sin asignar') : '';
  const alta = t.prioridad === 'alta' || t.prioridad === 'urgente';
  return `<button type="button" class="cs-chip est-${esc(t.estado)}${late ? ' late' : ''}" data-cal-tarea="${esc(t.id)}" style="--pc:${color}" title="${esc(t.titulo + (persona ? ' · ' + persona : ''))}">
    <span class="cs-t">${esc(t.titulo)}</span>
    <span class="cs-m"><i></i>${esc(late ? 'Atrasada' : (LABELS_ESTADO[t.estado] || t.estado))}${alta ? ' · ' + esc(t.prioridad) : ''}${persona ? ' · ' + esc(persona) : ''}</span>
  </button>`;
}
function renderCalendarioSemana(view) {
  const lunes = STATE.calLunes ? new Date(STATE.calLunes) : calLunes(new Date());
  STATE.calLunes = lunes.getTime();
  const dias = [...Array(7)].map((_, i) => { const d = new Date(lunes); d.setDate(d.getDate() + i); return d; });
  const isos = dias.map(calISO), hoy = calISO(new Date()), esEstaSemana = isos.includes(hoy);
  const sel = STATE.calTalento && STATE.talentos.some(t => t.id === STATE.calTalento) ? STATE.calTalento : '';
  const orden = (a, b) => (a.estado === 'completada') - (b.estado === 'completada') || PRIORIDADES.indexOf(b.prioridad) - PRIORIDADES.indexOf(a.prioridad) || String(a.titulo).localeCompare(String(b.titulo));
  const enSemana = t => t.fecha_entrega && t.fecha_entrega >= isos[0] && t.fecha_entrega <= isos[6];
  const semana = STATE.tareas.filter(t => enSemana(t) && (!sel || t.talento_id === sel));
  // filas: practicantes (los que estén activos o tengan algo esta semana) + "Sin asignar" si hay
  let personas = STATE.talentos.filter(t => sel ? t.id === sel : (t.estado !== 'inactivo' || semana.some(x => x.talento_id === t.id)));
  const filas = personas.map(t => ({ id: t.id, nombre: t.nombre, ini: t.avatar_inicial || initials(t.nombre), tareas: semana.filter(x => x.talento_id === t.id),
    antes: STATE.tareas.filter(x => x.talento_id === t.id && x.estado !== 'completada' && x.fecha_entrega && x.fecha_entrega < isos[0] && x.fecha_entrega < hoy).length }));
  const sinAsignar = sel ? [] : semana.filter(x => !x.talento_id || !STATE.talentos.some(t => t.id === x.talento_id));
  if (sinAsignar.length) filas.push({ id: '', nombre: 'Sin asignar', ini: '—', tareas: sinAsignar, antes: 0 });
  const total = semana.length, hechas = semana.filter(x => x.estado === 'completada').length;
  const cab = dias.map((d, i) => `<div class="cs-dia${isos[i] === hoy ? ' hoy' : ''}"><b>${DIAS_CORTOS[i]}</b><span>${d.getDate()}</span></div>`).join('');
  const celdas = f => isos.map((iso, i) => {
    const ts = f.tareas.filter(x => x.fecha_entrega === iso).sort(orden);
    return `<div class="cs-celda${iso === hoy ? ' hoy' : ''}" data-dia="${iso}" data-talento="${esc(f.id)}">${ts.map(t => calChip(t, false)).join('')}</div>`;
  }).join('');
  const grid = filas.length ? filas.map(f => `
      <div class="cs-persona">
        <div class="avatar">${esc(f.ini)}</div>
        <div class="cs-pn"><b>${esc(f.nombre)}</b><span>${f.tareas.length} tarea${f.tareas.length === 1 ? '' : 's'}${f.antes ? ` · <em title="Sin terminar, de semanas anteriores">${f.antes} atrasada${f.antes === 1 ? '' : 's'}</em>` : ''}</span></div>
      </div>${celdas(f)}`).join('') : '';
  // celular: lista por día
  const lista = isos.map((iso, i) => {
    const ts = semana.filter(x => x.fecha_entrega === iso).sort(orden);
    return `<section class="cs-ldia${iso === hoy ? ' hoy' : ''}"><h4>${DIAS_LARGOS[i]} ${dias[i].getDate()}${iso === hoy ? ' <span class="pill ok">Hoy</span>' : ''}</h4>
      ${ts.length ? ts.map(t => calChip(t, !sel)).join('') : '<p class="cs-vacio">Sin entregas</p>'}</section>`;
  }).join('');
  view.innerHTML = `
    ${calBarra()}
    <div class="cal-header cs-header">
      <button class="btn secondary small" id="cs-prev" aria-label="Semana anterior">‹ Anterior</button>
      <div class="cs-titulo"><h3>${calRango(dias[0], dias[6])}</h3><span>${total ? `${total} entrega${total === 1 ? '' : 's'} esta semana · ${hechas} completada${hechas === 1 ? '' : 's'}` : 'Sin entregas esta semana'}</span></div>
      <div class="cs-nav">${esEstaSemana ? '' : '<button class="btn secondary small" id="cs-hoy">Esta semana</button>'}<button class="btn secondary small" id="cs-next" aria-label="Semana siguiente">Siguiente ›</button></div>
    </div>
    ${filas.length ? `<div class="cs-grid" style="--filas:${filas.length}"><div class="cs-esq">${sel ? 'Practicante' : 'Equipo'}</div>${cab}${grid}</div>` : '<div class="empty-state">No hay practicantes para mostrar.</div>'}
    <div class="cs-lista">${lista}</div>`;
  calEnlazarBarra(view);
  const mover = n => { const d = new Date(STATE.calLunes); d.setDate(d.getDate() + 7 * n); STATE.calLunes = d.getTime(); renderCalendario(); };
  $('#cs-prev').onclick = () => mover(-1); $('#cs-next').onclick = () => mover(1);
  const h = $('#cs-hoy'); if (h) h.onclick = () => { STATE.calLunes = calLunes(new Date()).getTime(); renderCalendario(); };
  view.querySelectorAll('[data-cal-tarea]').forEach(b => b.onclick = () => openTareaModal(b.dataset.calTarea));
}

/* ============================================================
   FOTOGRAFÍA · conexión con el Scanner foto (v1)
   - Las tareas de tipo "Fotografía" creadas desde el scanner muestran
     el avance en vivo: localizadas, fotografiadas, editadas y subidas,
     por marca y por persona.
   - Practicantes: botón "Abrir scanner" en su tarea (misma clave).
   - La tarea se mueve sola: 1.ª foto → En progreso; 100 % subidas →
     En revisión (eso lo hace el servidor, migración scanner-foto-v1).
   ============================================================ */
STATE.fotoProg = {};
function esTareaFoto(t) { return !!t && /fotograf/i.test(String(t.tipo || '')); }
async function cargarProgresoFotos() {
  const ids = (STATE.tareas || []).filter(esTareaFoto).map(t => String(t.id));
  if (!ids.length) { STATE.fotoProg = {}; return false; }
  try {
    const r = await supa.rpc('foto_progreso', { p_tareas: ids, p_listas: null });
    if (r.error || !Array.isArray(r.data)) return false;
    const antes = JSON.stringify(STATE.fotoProg), m = {};
    r.data.forEach(x => { if (x && x.tarea_id) m[x.tarea_id] = x; });
    STATE.fotoProg = m;
    // el refresco automático compara las tareas: así también nota los cambios de fotos
    (STATE.tareas || []).forEach(t => { const x = m[String(t.id)]; if (x) t._foto = [x.total, x.localizado, x.fotografiado, x.editado, x.subido].join('/'); });
    return antes !== JSON.stringify(m);
  } catch (e) { return false; }
}
const FOTO_MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
function fotoNombreMes(m) { const t = String(m || ''); const k = parseInt(t.slice(5, 7), 10); return k ? `${FOTO_MESES[k - 1]} ${t.slice(0, 4)}` : ''; }
function fotoCuentas(x) {
  const fot = (x.fotografiado || 0) + (x.editado || 0) + (x.subido || 0);
  return { total: x.total || 0, loc: (x.localizado || 0) + fot, fot, edi: (x.editado || 0) + (x.subido || 0), sub: x.subido || 0 };
}
function fotoBarraHTML(c) {
  const pc = n => c.total ? (100 * n / c.total).toFixed(1) + '%' : '0%';
  return `<div class="foto-barra" role="img" aria-label="${c.fot} de ${c.total} fotografiadas, ${c.sub} subidas"><i class="fb-loc" style="width:${pc(c.loc)}"></i><i class="fb-fot" style="width:${pc(c.fot)}"></i><i class="fb-sub" style="width:${pc(c.sub)}"></i></div>`;
}
function linkScanner() {
  if (STATE.mode === 'admin') return 'scanner-foto.html?admin=1';
  if (STATE.mode === 'aprendiz' && STATE.talentoId) return 'scanner-foto.html?aprendiz=' + encodeURIComponent(STATE.talentoId);
  return '';
}
// Tarjeta del tablero (admin y dirección): barra + números
function fotoMiniHTML(t) {
  if (!esTareaFoto(t)) return '';
  const x = STATE.fotoProg[String(t.id)];
  if (!x) return '';
  const c = fotoCuentas(x), l = linkScanner();
  return `<div class="foto-mini">${fotoBarraHTML(c)}<div class="foto-mini-t"><span><b>${c.fot}</b>/${c.total} fotografiadas · <b>${c.sub}</b> subidas</span>${l ? `<a href="${esc(l)}" target="_blank" rel="noopener">Scanner</a>` : ''}</div></div>`;
}
// Tarjeta del practicante: reporte completo + botón al scanner
function fotoReporteHTML(t) {
  if (!esTareaFoto(t)) return '';
  const x = STATE.fotoProg[String(t.id)], l = linkScanner();
  const boton = l ? `<a class="btn foto-btn" href="${esc(l)}">${ico('check')} Abrir scanner de fotos</a>` : '';
  if (!x) return boton ? `<div class="foto-rep">${boton}</div>` : '';
  const c = fotoCuentas(x), pct = n => c.total ? Math.round(100 * n / c.total) + '%' : '0%';
  const marcas = (x.marcas || []).map(m => `<tr><td>${esc(m.marca)}</td><td>${m.fotografiadas}/${m.total}</td><td>${m.subidas}</td></tr>`).join('');
  const personas = (x.personas || []).map(p => `${esc(p.nombre)} ${p.fotos}`).join(' · ');
  return `<div class="foto-rep">
    <div class="foto-rep-h"><b>Avance de fotografía</b><span>${esc(x.nombre || '')}${x.mes ? ' · ' + esc(fotoNombreMes(x.mes)) : ''}</span></div>
    ${fotoBarraHTML(c)}
    <div class="foto-kpis"><div><b>${c.loc}</b><span>Localizadas · ${pct(c.loc)}</span></div><div><b>${c.fot}</b><span>Fotografiadas · ${pct(c.fot)}</span></div>
      <div><b>${c.edi}</b><span>Editadas · ${pct(c.edi)}</span></div><div><b>${c.sub}</b><span>Subidas · ${pct(c.sub)}</span></div></div>
    <p class="foto-pie">${c.total} referencias · faltan ${c.total - c.fot} por fotografiar${x.ultimo ? ' · último cambio ' + esc(haceCO(x.ultimo)) : ''}</p>
    ${marcas ? `<details class="foto-det"><summary>Por marca</summary><table><thead><tr><th>Marca</th><th>Fotog.</th><th>Subidas</th></tr></thead><tbody>${marcas}</tbody></table></details>` : ''}
    ${personas ? `<p class="foto-pie">Fotos por persona: ${personas}</p>` : ''}
    ${boton}
  </div>`;
}
(function () {
  const css = document.createElement('style');
  css.textContent = `
  .foto-mini{margin:8px 0 2px;}
  .foto-mini-t{display:flex;justify-content:space-between;gap:8px;font-size:11.5px;color:var(--ink-2);margin-top:5px;}
  .foto-mini-t b{color:var(--ink);font-weight:500;}
  .foto-barra{height:6px;border-radius:999px;background:var(--sunken);overflow:hidden;position:relative;}
  .foto-barra>i{position:absolute;left:0;top:0;bottom:0;border-radius:999px;}
  .foto-barra .fb-loc{background:var(--line-strong);} .foto-barra .fb-fot{background:var(--ok);opacity:.55;} .foto-barra .fb-sub{background:var(--ok);}
  .foto-rep{margin:12px 0;padding:14px;border:1px solid var(--line);border-radius:var(--r-md);background:var(--sunken);}
  .foto-rep-h{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px;font-size:13.5px;}
  .foto-rep-h b{font-weight:500;} .foto-rep-h span{color:var(--ink-2);}
  .foto-kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin:10px 0 6px;}
  @media (min-width:560px){.foto-kpis{grid-template-columns:repeat(4,1fr);}}
  .foto-kpis div{background:var(--panel);border-radius:8px;padding:8px 10px;}
  .foto-kpis b{display:block;font-size:20px;font-weight:500;line-height:1.1;}
  .foto-kpis span{font-size:11.5px;color:var(--ink-2);}
  .foto-pie{font-size:12.5px;color:var(--ink-2);margin:6px 0;}
  .foto-det summary{cursor:pointer;font-size:12.5px;color:var(--ink-2);margin:6px 0;}
  .foto-det table{width:100%;border-collapse:collapse;font-size:12.5px;}
  .foto-det th,.foto-det td{text-align:left;padding:4px 6px;border-bottom:1px solid var(--line);}
  .foto-btn{margin-top:10px;width:100%;justify-content:center;text-decoration:none;}`;
  document.head.appendChild(css);

  const _loadAll = loadAll;
  loadAll = async function () { const r = await _loadAll.apply(this, arguments); if (STATE.mode === 'admin') await cargarProgresoFotos(); return r; };
  const _cargarAprendiz = cargarAprendiz;
  cargarAprendiz = async function () { const r = await _cargarAprendiz.apply(this, arguments); if (r && r.ok) await cargarProgresoFotos(); return r; };
  const _cargarDireccion = cargarDireccion;
  cargarDireccion = async function () { const r = await _cargarDireccion.apply(this, arguments); if (r && r.ok) await cargarProgresoFotos(); return r; };

  const _sello = selloKanban;
  selloKanban = function (t) { return _sello(t) + fotoMiniHTML(t); };
  const _stepper = stepperHTML;
  stepperHTML = function (t) { return _stepper(t) + fotoReporteHTML(t); };

  // Admin: cada escaneo actualiza el reporte en vivo (con pausa para no redibujar a cada segundo)
  const _sub = subscribeRealtime;
  subscribeRealtime = function (cb) {
    _sub(cb);
    if (STATE.mode !== 'admin' || STATE._canalFoto) return;
    STATE._canalFoto = supa.channel('cambios-foto');
    STATE._canalFoto.on('postgres_changes', { event: '*', schema: 'public', table: 'foto_productos' }, () => {
      clearTimeout(STATE._tFoto);
      STATE._tFoto = setTimeout(async () => { if (await cargarProgresoFotos() && STATE._refrescar) STATE._refrescar(); }, 1500);
    });
    STATE._canalFoto.subscribe();
  };
})();

boot();
