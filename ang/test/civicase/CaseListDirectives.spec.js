/* eslint-env jasmine */

describe('CaseListDirective', function () {
  describe('civicaseStickyTableHeader directive', function () {
    var element, $compile, $rootScope, scope, affixReturnValue, affixOriginalFunction;

    beforeEach(module('civicase'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      scope = $rootScope.$new();
    }));

    beforeEach(function () {
      CRM.$('body').append('<div id="toolbar" style="height: 60px"></div>');

      element = $compile(angular.element('<div civicase-sticky-table-header> <table><thead><th>Sample title</th><th>Sample title</th></thead></table></div>'))(scope);
    });

    beforeEach(function () {
      affixOriginalFunction = CRM.$.fn.affix;
      CRM.$.fn.affix = jasmine.createSpy('affix');
      affixReturnValue = jasmine.createSpyObj('affix', ['on']);
      affixReturnValue.on.and.returnValue(affixReturnValue);
      CRM.$.fn.affix.and.returnValue(affixReturnValue);
    });

    afterEach(function () {
      CRM.$.fn.affix = affixOriginalFunction;

      CRM.$('#toolbar').remove();
    });

    describe('if loading is not complete and case is focused', function () {
      beforeEach(function () {
        scope.isLoading = true;
        scope.caseIsFocused = true;
        scope.$digest();
      });

      it('does not add min-width style to the table elements', function () {
        expect(element.find('thead').html()).not.toContain('style="min-width');
      });

      it('does not makes the header sticky', function () {
        expect(CRM.$.fn.affix).not.toHaveBeenCalledWith(jasmine.objectContaining({offset: {top: jasmine.any(Number)}}));
      });

      it('does not binds the scroll position of table content to the table header', function () {
        expect(affixReturnValue.on).not.toHaveBeenCalledWith('affixed.bs.affix', jasmine.any(Function));
      });

      it('does not resets the padding for top header and when the header gets back to its state', function () {
        expect(affixReturnValue.on).not.toHaveBeenCalledWith('affixed-top.bs.affix', jasmine.any(Function));
      });
    });

    describe('if loading is not complete and case is not focused', function () {
      beforeEach(function () {
        scope.isLoading = true;
        scope.caseIsFocused = false;
        scope.$digest();
      });

      it('does not add min-width style to the table elements', function () {
        expect(element.find('thead').html()).not.toContain('style="min-width');
      });

      it('does not makes the header sticky', function () {
        expect(CRM.$.fn.affix).not.toHaveBeenCalledWith(jasmine.objectContaining({offset: {top: jasmine.any(Number)}}));
      });

      it('does not binds the scroll position of table content to the table header', function () {
        expect(affixReturnValue.on).not.toHaveBeenCalledWith('affixed.bs.affix', jasmine.any(Function));
      });

      it('does not resets the padding for top header and when the header gets back to its state', function () {
        expect(affixReturnValue.on).not.toHaveBeenCalledWith('affixed-top.bs.affix', jasmine.any(Function));
      });
    });

    describe('if loading is complete and case is focused', function () {
      beforeEach(inject(function ($timeout) {
        scope.isLoading = false;
        scope.caseIsFocused = true;
        scope.$digest();
      }));

      it('does not add min-width style to the table elements', function () {
        expect(element.find('thead').html()).not.toContain('style="min-width');
      });

      it('does not makes the header sticky', function () {
        expect(CRM.$.fn.affix).not.toHaveBeenCalledWith(jasmine.objectContaining({offset: {top: jasmine.any(Number)}}));
      });

      it('does not binds the scroll position of table content to the table header', function () {
        expect(affixReturnValue.on).not.toHaveBeenCalledWith('affixed.bs.affix', jasmine.any(Function));
      });

      it('does not resets the padding for top header and when the header gets back to its state', function () {
        expect(affixReturnValue.on).not.toHaveBeenCalledWith('affixed-top.bs.affix', jasmine.any(Function));
      });
    });

    describe('if loading is complete and case is not focussed', function () {
      beforeEach(inject(function ($timeout) {
        scope.isLoading = false;
        scope.caseIsFocused = false;
        scope.$digest();
        $timeout.flush(); // Flushing any timeouts used.
      }));

      it('adds min-width style to the table elements', function () {
        expect(element.find('thead').html()).toContain('style="min-width');
      });

      it('makes the header sticky', function () {
        expect(CRM.$.fn.affix).toHaveBeenCalledWith(jasmine.objectContaining({offset: {top: jasmine.any(Number)}}));
      });

      it('binds the scroll position of table content to the table header', function () {
        expect(affixReturnValue.on).toHaveBeenCalledWith('affixed.bs.affix', jasmine.any(Function));
      });

      it('resets the padding for top header and when the header gets back to its state', function () {
        expect(affixReturnValue.on).toHaveBeenCalledWith('affixed-top.bs.affix', jasmine.any(Function));
      });
    });

    describe('table list padding', function () {
      var affixEventHandler;

      beforeEach(inject(function ($timeout) {
        element.find('thead').css('height', '100px');
        scope.$digest();
        $timeout.flush();

        affixEventHandler = affixReturnValue.on.calls.argsFor(0)[1];
      }));

      describe('when scrolling and the toolbar drawer is visible', function () {
        beforeEach(inject(function () {
          affixEventHandler();
        }));

        it('adds a padding to the table equal to the table header', function () {
          expect(element.css('padding-top')).toBe(element.find('thead').css('height'));
        });
      });

      describe('when scrolling and the toolbar drawer is not visible', function () {
        beforeEach(function () {
          CRM.$('#toolbar').hide();
          affixEventHandler();
        });

        it('does not add a padding to the table', function () {
          expect(element.css('padding-top')).toBe('');
        });
      });
    });
  });

  describe('civicaseStickyFooterPager directive', function () {
    var element, $compile, $rootScope, scope, offsetOriginalFunction, scrollTopOriginalFunction, $timeout;

    beforeEach(module('civicase'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      scope = $rootScope.$new();
      $timeout = _$timeout_;
    }));

    beforeEach(function () {
      offsetOriginalFunction = CRM.$.fn.offset;
      scrollTopOriginalFunction = CRM.$.fn.scrollTop;
    });

    beforeEach(function () {
      // Creating a custom function to mock offset() jQuery function
      CRM.$.fn.offset = function () {
        return { top: 1000 };
      };
      element = $compile(angular.element('<div class="parent"><div class="content"></div><div class="civicase__pager" civicase-sticky-footer-pager>Pager</div></div>'))(scope);
      // Setting up the height of the page be adding height to the content
      CRM.$(element).find('.content').height('1000px');
    });

    afterEach(function () {
      CRM.$.fn.offset = offsetOriginalFunction;
      CRM.$.fn.scrollTop = scrollTopOriginalFunction;
    });

    describe('if loading is not complete', function () {
      describe('basic tests', function () {
        beforeEach(function () {
          setupCommonSteps(true, scope, 0);
        });

        it('removes the sticky footer feature', function () {
          expect(element.hasClass('civicase__pager--fixed')).toBe(false);
        });
      });

      describe('when pager is not in view', function () {
        beforeEach(function () {
          setupCommonSteps(true, scope, 0);
        });

        it('should not fix the pager to the footer', function () {
          expect(element.find('.civicase__pager').hasClass('civicase__pager--fixed')).toBe(false);
        });
      });

      describe('when pager is in view', function () {
        beforeEach(function () {
          setupCommonSteps(true, scope, 1200);
        });

        it('should not fix the pager to the footer', function () {
          expect(element.find('.civicase__pager').hasClass('civicase__pager--fixed')).toBe(false);
        });
      });
    });

    describe('if loading is complete', function () {
      describe('when pager is not in view', function () {
        beforeEach(function () {
          setupCommonSteps(false, scope, 0);
        });

        it('should fix the pager to the footer', function () {
          expect(element.find('.civicase__pager').hasClass('civicase__pager--fixed')).toBe(true);
        });
      });

      describe('when pager is in view', function () {
        beforeEach(function () {
          setupCommonSteps(false, scope, 1200);
        });

        it('should not fix the pager to the footer', function () {
          expect(element.find('.civicase__pager').hasClass('civicase__pager--fixed')).toBe(false);
        });
      });
    });

    /**
     * Common setup for tests
     *
     * @params {boolean} loading - wheather loading is complete
     * @params {Object} scope
     * @params {Number} top - px from top the screen should scroll to.
     */
    function setupCommonSteps (loading, scope, top) {
      scope.isLoading = loading;
      // Creating a custom function to mock offset() jQuery function
      CRM.$.fn.scrollTop = function () {
        return top;
      };

      scope.$digest();

      if (!loading) {
        $timeout.flush(); // Flushing any timeouts used.
      }
    }
  });

  describe('civicaseCaseListSortHeader directive', function () {
    var element, $compile, $rootScope, scope;

    beforeEach(module('civicase'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      scope = $rootScope.$new();
    }));

    describe('basic tests', function () {
      var header;

      describe('when sortable is false', function () {
        beforeEach(function () {
          scope.sort = { field: '', dir: '', sortable: false };
          header = {
            display_type: 'activity_card',
            label: 'Next Activity',
            name: 'next_activity',
            sort: 'next_activity'
          };
          compileDirective(scope, header);
        });

        it('does not make the header sortable', function () {
          expect(element.hasClass('civicase__case-list-sortable-header')).not.toBe(true);
        });
      });
      describe('when header is blank', function () {
        beforeEach(function () {
          scope.sort = { field: '', dir: '', sortable: true };
          header = '';
          compileDirective(scope, header);
        });

        it('does not make the header sortable', function () {
          expect(element.hasClass('civicase__case-list-sortable-header')).not.toBe(true);
        });
      });
      describe('when sortable is true and header is not blank', function () {
        describe('basic tests', function () {
          beforeEach(function () {
            scope.sort = { field: '', dir: '', sortable: true };
            header = 'next_activity';
            compileDirective(scope, header);
          });

          it('makes the header sortable', function () {
            expect(element.hasClass('civicase__case-list-sortable-header')).toBe(true);
          });
        });

        describe('headerClickEventHandler', function () {
          describe('when the clicked header is already sorted', function () {
            beforeEach(function () {
              header = 'next_activity';
              scope.sort = { field: header, dir: '', sortable: true };
              scope.changeSortDir = jasmine.createSpy('changeSortDir');
              compileDirective(scope, header);
              element.trigger('click');
            });

            it('changes the sorting direction', function () {
              expect(scope.changeSortDir).toHaveBeenCalled();
            });
          });

          describe('when the clicked header is not already sorted', function () {
            beforeEach(function () {
              header = 'next_activity';
              scope.sort = { field: 'not_next_activity', dir: '', sortable: true };
              scope.changeSortDir = jasmine.createSpy('changeSortDir');
              compileDirective(scope, header);
              element.trigger('click');
            });

            it('sorts the clicked header', function () {
              expect(scope.sort.field).toBe(header);
            });

            it('sorts the clicked header in ascending order', function () {
              expect(scope.sort.dir).toBe('ASC');
            });
          });
        });

        describe('sortWatchHandler', function () {
          beforeEach(function () {
            header = 'next_activity';
            scope.sort = { field: header, dir: '', sortable: true };
            scope.changeSortDir = jasmine.createSpy('changeSortDir');
            compileDirective(scope, header);
          });

          describe('when the clicked header is already sorted', function () {
            beforeEach(function () {
              scope.sort = { field: header, dir: 'ASC', sortable: true };
              scope.$digest();
            });

            it('changes the sorting icon direction', function () {
              expect(element.hasClass('active')).toBe(true);
            });

            it('removes the sorting icon before adding a new one', function () {
              expect(element.find('.civicase__case-list__header-toggle-sort').length).toBe(1);
            });

            it('adds the sorting icon before adding a new one', function () {
              expect(element.html()).toContain('civicase__case-list__header-toggle-sort');
            });
          });

          describe('when the sorting direction is ascending', function () {
            beforeEach(function () {
              scope.sort = { field: header, dir: 'ASC', sortable: true };
              scope.$digest();
            });

            it('adds the upward sorting icon', function () {
              expect(element.html()).toContain('arrow_upward');
            });
          });

          describe('when the sorting direction is decsending', function () {
            beforeEach(function () {
              scope.sort = { field: header, dir: 'DESC', sortable: true };
              scope.$digest();
            });

            it('adds the upward sorting icon', function () {
              expect(element.html()).toContain('arrow_downward');
            });
          });
        });
      });
    });

    /**
     * Compiles the directive
     *
     * @param {object} scope
     * @param {string} header
     */
    function compileDirective (scope, header) {
      element = $compile(angular.element('<div civicase-case-list-sort-header=' + header + '></div>'))(scope);
    }
  });
});
